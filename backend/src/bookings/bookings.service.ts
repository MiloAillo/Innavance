import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { BookBodyDto } from './dto/book-body.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateAccountId } from './helper/generate-account-id';
import * as bcrypt from "bcrypt"
import axios from 'axios';
import { generateRoomPin } from './helper/generate-room-pin';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BookingsService {
    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('booking-queue') private readonly bookingQueue: Queue
    ) {}

    async book(bookBodyDto: BookBodyDto) {
        // variable for future uses
        let price = 0                     // might be temporary
        const paymentMethod = "e-money"     // temporary, cuz i haven't figured out the payment gateway


        // 1. CHECKING THE USER REQUEST
        // grab the room detail for checking
        // also grab all the bookings that fulfilled the where constraint
        // also grab the room addons
        const room = await this.prisma.rooms.findUnique({
            where: { id: bookBodyDto.room_id },
            include: {
                bookings: {
                    where: {
                        status: {
                            in: ["on_hold", "checked_in", "checking_out"]
                        }
                    }
                },
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
        const reservedCount = room.bookings.map((object) => object.id).length
        if (reservedCount !== 0) throw new UnauthorizedException("Room is already reserved")

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
        await this.prisma.bookings.create({
            data: {
                room_id: room.id,
                status: waitForApproval ? "on_hold" : "checked_in",
                name: bookBodyDto.full_name,
                phoneNumber: bookBodyDto.phone_number,
                duration: bookBodyDto.duration,
                price: price,
                paymentMethod: paymentMethod,
                isAddonServed: bookBodyDto.addons.length === 0 ? true : false,
                isInnkeeperCalled: false
            }
        })


        // 3. IF THE waitForApproval IS FALSE, GENERATE THE ROOM accountId AND ROTATE THE ROOM PIN AND SEND IT TO THE USER PHONE NUMBER
        // IF NOT THEN TELL THE CLIENT TO WAIT
        if (!waitForApproval) {
            this.checkedIn(room.name, room.id, bookBodyDto.phone_number)
        } else {
            this.onHold(room.name, bookBodyDto.phone_number, adminSettings?.isAutoApprove ?? false, adminSettings?.autoApproveTime ?? 10, room.id)
        }

        return {
            room_name: room.name,
            duration: bookBodyDto.duration,
            price: price,
            addons: responseAddons,
            wait_for_approval: waitForApproval
        }
    }

    // modular function used by another function to make booking automatically switch to checked in based on autoApprove state and time
    async onHold(room_name: string, phone_number: string, isAutoApprove: boolean, autoApproveTime: number, room_id: number) {
        // if autoApprove is ON, then make a queue to bullMQ    =>   refer to ./src/processor/booking.processor.ts
        if (isAutoApprove) {
            this.bookingQueue.add(
                'auto-checkin',
                {
                    room_name,
                    room_id,
                    phone_number
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
    async checkedIn(room_name: string, room_id: number, phone_number: string) {
        const accountId = generateAccountId()
        const smartDoorPin = generateRoomPin()

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
}
