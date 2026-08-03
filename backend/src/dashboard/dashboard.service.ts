import { BadRequestException, Injectable } from '@nestjs/common';
import { RequestWithRoomData } from './guard/dashboard.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { CallInnkeeperDto } from './dto/call-innkeeper.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    async view(request: RequestWithRoomData) {
        // grab the notification count
        const notificationsCount = await this.prisma.bookingsNotifications.count({
            where: { booking_id: request.data.bookings[0].id }
        })

        return {
            room: {
                id: request.data.id,
                name: request.data.name,
                price: request.data.price,
                capacity: request.data.capacity,
                description: request.data.description,
            },
            metrics: {
                is_addon_served: request.data.bookings[0].isAddonServed,
                is_innkeeper_called: request.data.bookings[0].isInnkeeperCalled,
                checkout_grace_time: request.data.bookings[0].checkoutGraceTime,
                created_at: request.data.bookings[0].createdAt,
                updated_at: request.data.bookings[0].updatedAt,
                smart_door_is_locked: request.data.smartDoorIsLocked,
                smart_door_is_opened: request.data.smartDoorIsOpened,
                water_output: request.data.waterOutput,
                electricity_output: request.data.electricityOutput
            },
            booking: {
                id: request.data.bookings[0].id,
                status: request.data.bookings[0].status,
                name: request.data.bookings[0].name,
                duration: request.data.bookings[0].duration,
                price: request.data.bookings[0].price,
                payment_method: request.data.bookings[0].paymentMethod,
            },
            notifications: request.data.bookings[0].bookingsNotifications,
            notificationsCount: notificationsCount
        }
    }

    async callInnkeeper(callInnkeeperDto: CallInnkeeperDto, request: RequestWithRoomData) {
        // throw error if the value requested already met
        if (request.data.bookings[0].isInnkeeperCalled === callInnkeeperDto.value) {
            throw new BadRequestException("value requested already met")
        }

        // change booking isInnkeeperCalled value to the requested value
        await this.prisma.bookings.update({
            where: { id: request.data.bookings[0].id },
            data: { isInnkeeperCalled: callInnkeeperDto.value }
        })
        
        if (callInnkeeperDto.value) {
            // create web notifications 
            await this.prisma.bookingsNotifications.create({
                data: {
                    booking_id: request.data.bookings[0].id,
                    type: "important",
                    title: "Innkeeper has been called",
                    description: "Don't go anywhere, Innkeeper will arrive at your door shortly."
                }
            })
        }
    }

    async getNotifications(notificationQueryDto: NotificationQueryDto, request: RequestWithRoomData) {
        const { page = 1, limit = 10, order_by = 'createdAt', order = 'desc', filter_type = ['info', 'important', 'warning'] } = notificationQueryDto

        // build a pagination system
        const skip = (page - 1) * limit    // calculate how many to skip

        // dynamic variable for ordering rooms data
        const dataOrder = { [order_by]: order }

        // grab the notifications and their total count
        const [ notifications, notificationsTotalCount ] = await Promise.all([
            this.prisma.bookingsNotifications.findMany({
                where: { 
                    booking_id: request.data.bookings[0].id,
                    type: {
                        in: filter_type
                    }
                },
                skip: skip,
                take: limit,
                orderBy: dataOrder,
                select: {
                    id: true,
                    type: true,
                    title: true,
                    description: true,
                    createdAt: true
                }
            }),
            // fetch total notification
            this.prisma.bookingsNotifications.count({
                where: { 
                    booking_id: request.data.bookings[0].id,
                    type: {
                        in: filter_type
                    }
                }
            }),
        ])

        return {
            notifications,
            meta: {
                notification_total: notificationsTotalCount,
                page,
                order,
                order_by,
                hasPageBefore: page !== 1,
                hasPageAfter: skip + limit < notificationsTotalCount 
            }
        }
    }
}
