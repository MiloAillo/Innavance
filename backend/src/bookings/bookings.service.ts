import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { BookBodyDto } from './dto/book-body.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateAccountId } from '../helper/generate-account-id';
import * as bcrypt from "bcrypt"
import axios from 'axios';
import { generateRoomPin } from '../helper/generate-room-pin';
import { InjectQueue } from '@nestjs/bullmq';
import { delay, Queue } from 'bullmq';
import maskData from 'maskdata'

@Injectable()
export class BookingsService {
    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('booking-queue') private readonly bookingQueue: Queue
    ) {}

    async detail(bookingId: number) {
        // grab the booking detail that the user specified
        const booking = await this.prisma.bookings.findUnique({
            where: { id: bookingId },
            select: {
                name: true,
                phoneNumber: true,
                duration: true,
                price: true,
                paymentMethod: true,
                isAutoApprove: true,
                status: true,
                autoApproveTime: true,
                createdAt: true,
                bookingRoom: {
                    select: {
                        name: true
                    }
                }
            }
        })
        if (!booking) throw new NotFoundException("booking data with id specified doesn't exist")

        return {
            name: maskData.maskStringV2(booking.name, {
                unmaskedStartCharacters: 1,
                unmaskedEndCharacters: 2
            }),
            phone_number: maskData.maskPhone(booking.phoneNumber, {
                unmaskedStartDigits: 3,
                unmaskedEndDigits: 3
            }),
            status: booking.status,
            duration: booking.duration,
            price: maskData.maskStringV2(booking.price.toString()),
            payment_method: booking.paymentMethod,
            room_name: booking.bookingRoom.name,
            is_auto_approve: booking.isAutoApprove,
            auto_approve_time: booking.autoApproveTime,
            created_at: booking.createdAt
        }
    }

    async book(bookBodyDto: BookBodyDto) {
        // variable for future uses
        let price = 0                     // might be temporary
        const paymentMethod = bookBodyDto.payment_method


        // 1. CHECKING THE USER REQUEST
        // grab the room detail for checking
        // also grab all the bookings that fulfilled the where constraint
        // also grab the room addons
        const room = await this.prisma.rooms.findUnique({
            where: { id: bookBodyDto.room_id },
            include: {
                roomsAddons: {
                    include: {
                        addon: true
                    }
                }
            }
        })

        // throw error not found if room isn't found
        if (!room) throw new NotFoundException("No room specified by room_id found")
        
        // throw error if room already reserved
        if (!room.isAvailable) throw new UnauthorizedException("Room is already reserved")

        // build an addons lookup map
        const roomAddons = {}
        room.roomsAddons.forEach((object) => {
            roomAddons[object.addon.id] = object.addon
        })

        // build an addon ids array
        const roomAddonsId = room.roomsAddons.map((object) => object.addon.id) 

        // build response addons
        const responseAddons: {}[] = []

        bookBodyDto.addons.forEach((addon) => {
            // throw error if addon requested doesn't exist in this requested room
            if (!roomAddonsId.includes(addon.id)) throw new UnauthorizedException(`addon_id ${addon.id} isn't available`)
            
            // throw error if addon exceed maximum borrow allowed
            if (addon.count > roomAddons[addon.id].borrowMaximum) throw new UnauthorizedException(`addon_id ${addon.id} exceed maximum borrow allowed`)

            // add the total addon price to the price variable
            price += roomAddons[addon.id].price * addon.count

            responseAddons.push({
                addon_name: roomAddons[addon.id].name,
                count: addon.count,
                price: roomAddons[addon.id].price * addon.count
            })
        })

        // calculate duration price
        price += room.price * bookBodyDto.duration

        // check admin auto approve settings
        const adminSettings = await this.prisma.admin.findUnique({
            where: { id: 1 },
            select: {
                isAutoApprove: true,
                autoApproveTime: true
            }
        })

        // if auto approve is ON and auto approve time is 0 (instant)
        // then waitForApproval is false
        const waitForApproval = adminSettings?.isAutoApprove === true ? adminSettings.autoApproveTime === 0 ? false : true : true


        // 2. CREATE THE BOOKING
        const addonsToCreate = bookBodyDto.addons.map((addon) => ({
            addon_id: addon.id,
            count: addon.count,
        }))

        const [ booking ] = await Promise.all([
            // the the actual booking data
            this.prisma.bookings.create({
                data: {
                    room_id: room.id,
                    status: waitForApproval ? "on_hold" : "checked_in",
                    name: bookBodyDto.full_name,
                    phoneNumber: bookBodyDto.phone_number,
                    duration: bookBodyDto.duration,
                    price: price,
                    isAutoApprove: adminSettings?.isAutoApprove,
                    autoApproveTime: adminSettings?.autoApproveTime,
                    paymentMethod: paymentMethod,
                    isAddonServed: bookBodyDto.addons.length === 0 ? true : false,
                    isInnkeeperCalled: false,

                    bookingsAddons: {
                        createMany: {
                            data: addonsToCreate
                        }
                    }
                }
            }),
            // update room isAvailable to false
            this.prisma.rooms.update({
                where: { id: room.id },
                data: { isAvailable: false }
            })
        ])

        // 3. IF THE waitForApproval IS FALSE, GENERATE THE ROOM accountId AND ROTATE THE ROOM PIN AND SEND IT TO THE USER PHONE NUMBER
        // IF NOT THEN TELL THE CLIENT TO WAIT
        if (!waitForApproval) {
            await this.checkedIn(room.name, room.id, bookBodyDto.phone_number, booking.id)
        } else {
            await this.onHold(room.name, bookBodyDto.phone_number, adminSettings?.isAutoApprove ?? false, adminSettings?.autoApproveTime ?? 10, room.id, booking.id)
        }

        return {
            room_name: room.name,
            duration: bookBodyDto.duration,
            price: price,
            addons: responseAddons,
            wait_for_approval: waitForApproval
        }
    }

    async checkout(bookingId: number, accountId: string) {
        // grab the booking where the booking match the id and the accountId match the room the booking is in
        const booking = await this.prisma.bookings.findUnique({
            where: {
                id: bookingId,
                status: "checked_in",
                bookingRoom: {
                    accountId: accountId
                }
            },
            include: {
                bookingRoom: true
            }
        })
        if (!booking) throw new NotFoundException("no active booking found")
        
        // fetch admin settings to check the grace time
        const adminSettings = await this.prisma.admin.findUnique({
            where: { id: 1 }
        })
        if (!adminSettings) throw new InternalServerErrorException()
        
        // build state variable that check if grace period is instant (0)
        const isNoGraceTime = adminSettings.checkOutGracePeriod === 0 ? true : false

        if (isNoGraceTime) this.checkedOut(booking.bookingRoom.name, booking.bookingRoom.id, booking.id, booking.phoneNumber)
        else this.checkingOut(booking.bookingRoom.name, booking.bookingRoom.id, booking.id, booking.phoneNumber)

        return {
            status: isNoGraceTime ? "checked_out" : "checking_out",
            grace_period: adminSettings.checkOutGracePeriod
        }
    }

    // modular function used by another function to make booking automatically switch to checked in based on autoApprove state and time
    async onHold(room_name: string, phone_number: string, isAutoApprove: boolean, autoApproveTime: number, room_id: number, booking_id: number) {
        // if autoApprove is ON, then make a queue to bullMQ    =>   refer to ./src/processor/booking.processor.ts
        if (isAutoApprove) {
            this.bookingQueue.add(
                'auto-checkin',
                {
                    room_name,
                    room_id,
                    phone_number,
                    booking_id
                },
                {
                    delay: autoApproveTime * 60 * 1000,
                }
            )
        }

        // send confirmation to the client
        await axios.post(`${process.env.WHATSAPP_SERVICE_URL ?? "http://localhost:3001" }/send`, {
            phone_number: phone_number,
            message: `Thank you for reserving a room at Innavance.\nYour reserve request for ${room_name} are currently being reviewed by us, we will notify you about our decision here.\n\nFor complete detail about your reservation status, please access the URL below\nURL: http://masih-template-kalo-ini/login`
        }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })
    }
    
    // modular function used by another function to update the room state to checked in from being on hold in approval queue 
    async checkedIn(room_name: string, room_id: number, phone_number: string, booking_id: number) {
        const accountId = generateAccountId()
        const smartDoorPin = generateRoomPin()

        // change whose on_hold in that room to checked in
        await this.prisma.bookings.update({
            where: { id: booking_id },
            data: { status: "checked_in" }
        })

        // update the room accountId and door pin
        await this.prisma.rooms.update({
            where: { id: room_id },
            data: {
                accountId: accountId,
                smartDoorPin: smartDoorPin
            }
        })

        // send the accountId and door PIN to the client
        await axios.post(`${process.env.WHATSAPP_SERVICE_URL ?? "http://localhost:3001" }/send`, {
            phone_number: phone_number,
            message: `Thank you for reserving a room at Innavance.\nYour reserve request for ${room_name} has been approved by us, please use the PIN code below to unlock your room door.\nPIN: ${smartDoorPin}\n\n\nDon't forget to access your room dashboard in our web for checking out, calling the innkeeper, and monitor your own room by clicking the url below.\nURL: http://masih-template-kalo-ini/login,\nAccountId: ${accountId}\n\n\nHave any question? don't be shy to call our innkeeper through the dashboard!`
        }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })
    }

    // modular function used by another function to update the room state to checking out
    async checkingOut(room_name: string, room_id: number, booking_id: number, phone_number: string) {
        // grab the admin settings
        const adminSettings = await this.prisma.admin.findUnique({
            where: { id: 1 }
        })
        if (!adminSettings) throw new InternalServerErrorException()

        // change the booking status to checking out
        await this.prisma.bookings.update({
            where: { id: booking_id },
            data: { status: "checking_out" }
        })

        // add to queue to trigger automatic check out after grace period expired
        this.bookingQueue.add(
            'auto_checkout',
            {
                room_name,
                room_id,
                booking_id,
                phone_number
            },
            {
                delay: adminSettings.checkOutGracePeriod * 60 * 1000
            }
        )

        // notify the client
        await axios.post(`${process.env.WHATSAPP_SERVICE_URL ?? "http://localhost:3001" }/send`, {
            phone_number: phone_number,
            message: `It looks like you checked out from ${room_name} at Innavance.\nWe give you ${adminSettings.checkOutGracePeriod} minutes to pack your belongings and kiss our room goodbye.\n\nPlease leave the room before the grace period ends, as the door PIN will become unusable.`
        }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })
    }

    // modular function used by another function to update the rom state to checked out
    async checkedOut(room_name: string, room_id: number, booking_id: number, phone_number: string) {
        // grab the admin settings
        const adminSettings = await this.prisma.admin.findUnique({
            where: { id: 1 }
        })
        if (!adminSettings) throw new InternalServerErrorException()
        
        // rotate the door PIN to the default value and remove the accountId
        await this.prisma.rooms.update({
            where: { id: room_id },
            data: {
                smartDoorPin: adminSettings.smartDoorDefaultPin,
                accountId: null,
                isAvailable: true
            }
        })

        // change the booking status to checked out
        await this.prisma.bookings.update({
            where: { id: booking_id },
            data: { status: "checked_out" }
        })

        // notify the client
        await axios.post(`${process.env.WHATSAPP_SERVICE_URL ?? "http://localhost:3001" }/send`, {
            phone_number: phone_number,
            message: `You have checked out from ${room_name} at Innavance.\nThe door PIN and Dashboard is now unusable.\n\nThank you for choosing us, we always welcome you and are excited to see you again! 😉\n`
        }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })
    }
}
