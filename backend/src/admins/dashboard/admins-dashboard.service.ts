import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { RequestWithJWTPayload } from '../guard/jwt-auth-guard.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingStatus, Order, OrderBy, RoomIsAvailable, RoomQueryDto } from '../admins-auth/dto/room-query.dto';

@Injectable()
export class AdminsDashboardService {
    constructor(private readonly prisma: PrismaService) {}

    async getUserInfo(request: RequestWithJWTPayload) {
        // grab the user data from db according to the parsed token specified
        const user = await this.prisma.adminUsers.findUnique({
            where: { id: request.user.id },
            select: {
                id: true,
                name: true,
                type: true,
                username: true
            }
        })
        if (!user) throw new UnauthorizedException()

        return user
    }

    async getRooms(roomQueryDto: RoomQueryDto) {        
        const { 
            filter_available_room = RoomIsAvailable.both, 
            include_booking = false,
            filter_booking_status = [BookingStatus.checked_in, BookingStatus.checked_out, BookingStatus.checking_out, BookingStatus.on_hold, BookingStatus.rejected],
            room_name = undefined,
            filter_call = undefined,
            filter_addon_served = undefined,
            order = Order.desc,
            order_by = OrderBy.name,
            page = 1,
            limit = 10
        } = roomQueryDto
        
        // build the dynamic filtering and sorting
        const skip = (page - 1) * limit    

        const isAvailableORM = filter_available_room !== "both"
            ? { isAvailable: filter_available_room === "true" }
            : undefined

        const includeORM = include_booking
            ? {
                include: {
                    bookings: {
                        where: {
                            status: {
                                in: filter_booking_status
                            },
                            isInnkeeperCalled: filter_call,
                            isAddonServed: filter_addon_served
                        }
                    }
                }
              }
            : undefined

        const whereBookingsConstraintORM = typeof filter_call !== "undefined" || typeof filter_addon_served !== "undefined"  
            ? {
                some: {
                    isInnkeeperCalled: filter_call,
                    isAddonServed: filter_addon_served
                }
                }
            : undefined

        // grab the room requested
        const [rooms, roomsCount] = await Promise.all([
            this.prisma.rooms.findMany({
                where: {
                    ...isAvailableORM,
                    name: {
                        contains: room_name
                    },
                    bookings: whereBookingsConstraintORM
                },
                ...includeORM,
                orderBy: {
                    [order_by]: order
                },
                skip: skip,
                take: limit
            }),
            this.prisma.rooms.count({
                where: {
                    ...isAvailableORM,
                    name: {
                        contains: room_name
                    },
                    bookings: whereBookingsConstraintORM
                }
            })
        ]) 

        // grab the admin settings to allow frontend render different stuff
        const adminSettings = await this.prisma.admin.findUnique({ where: { id: 1 } })
        if (!adminSettings) throw new InternalServerErrorException()

        return {
            data: rooms,
            meta: {
                is_staff_allowed_to_approve: adminSettings.isStaffAllowedToApprove,
                is_staff_allowed_to_dismiss_call: adminSettings.isStaffAllowedToDismissCall,
                is_staff_allowed_to_force_checkout: adminSettings.isStaffAllowedToForceCheckout,
                page,
                order,
                order_by,
                has_page_before: page !== 1,
                has_page_after: skip + limit < roomsCount,
                page_end: Math.ceil(roomsCount / limit)
            }
        }

        /// add the pagination info to meta

    }
}
