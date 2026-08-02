import { Injectable } from '@nestjs/common';
import { RequestWithRoomData } from './guard/dashboard.guard';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
