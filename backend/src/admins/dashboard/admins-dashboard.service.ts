import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RequestWithJWTPayload } from '../guard/jwt-auth-guard.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminUsersOrderBy, AdminUsersQueryDto, AdminUsersType, Order as AdminUsersOrder } from '../dto/admin-users-query.dto';
import { BookingQueryDto, BookingOrderBy, BookingStatus as BookingQueryStatus, Order as BookingQueryOrder } from '../dto/booking-query.dto';
import { BookingStatus, Order, OrderBy, RoomIsAvailable, RoomQueryDto } from '../dto/room-query.dto';
import { DismissCallDto } from '../dto/dismiss-call.dto';

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

    async getBookings(bookingQueryDto: BookingQueryDto) {
        const {
            filter_booking_status = [BookingQueryStatus.checked_in, BookingQueryStatus.checked_out, BookingQueryStatus.checking_out, BookingQueryStatus.on_hold, BookingQueryStatus.rejected],
            booking_name = undefined,
            booking_phone_number = undefined,
            room_name = undefined,
            payment_method = undefined,
            include_room = true,
            filter_call = undefined,
            filter_addon_served = undefined,
            filter_auto_approve = undefined,
            order = BookingQueryOrder.desc,
            order_by = BookingOrderBy.createdAt,
            page = 1,
            limit = 10
        } = bookingQueryDto

        const skip = (page - 1) * limit

        const whereORM = {
            status: {
                in: filter_booking_status
            },
            ...(typeof booking_name !== "undefined" ? {
                name: {
                    contains: booking_name
                }
            } : {}),
            ...(typeof booking_phone_number !== "undefined" ? {
                phoneNumber: {
                    contains: booking_phone_number
                }
            } : {}),
            ...(typeof payment_method !== "undefined" ? {
                paymentMethod: {
                    contains: payment_method
                }
            } : {}),
            ...(typeof filter_call !== "undefined" ? {
                isInnkeeperCalled: filter_call
            } : {}),
            ...(typeof filter_addon_served !== "undefined" ? {
                isAddonServed: filter_addon_served
            } : {}),
            ...(typeof filter_auto_approve !== "undefined" ? {
                isAutoApprove: filter_auto_approve
            } : {}),
            ...(typeof room_name !== "undefined" ? {
                bookingRoom: {
                    name: {
                        contains: room_name
                    }
                }
            } : {})
        }

        const orderByORM = order_by === BookingOrderBy.room_name
            ? {
                bookingRoom: {
                    name: order
                }
            }
            : {
                [order_by]: order
            }

        const includeORM = include_room
            ? {
                include: {
                    bookingRoom: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            capacity: true,
                            isAvailable: true
                        }
                    }
                }
            }
            : undefined

        const [bookings, bookingsCount] = await Promise.all([
            this.prisma.bookings.findMany({
                where: whereORM,
                ...includeORM,
                orderBy: orderByORM,
                skip: skip,
                take: limit
            }),
            this.prisma.bookings.count({
                where: whereORM
            })
        ])

        return {
            data: bookings,
            meta: {
                page,
                order,
                order_by,
                has_page_before: page !== 1,
                has_page_after: skip + limit < bookingsCount,
                page_end: Math.ceil(bookingsCount / limit)
            }
        }
    }

    async getAdminUsers(adminUsersQueryDto: AdminUsersQueryDto) {
        const {
            filter_type = [AdminUsersType.manager, AdminUsersType.staff],
            filter_admin_id = undefined,
            name = undefined,
            username = undefined,
            include_admin = false,
            order = AdminUsersOrder.desc,
            order_by = AdminUsersOrderBy.createdAt,
            page = 1,
            limit = 10
        } = adminUsersQueryDto

        const skip = (page - 1) * limit

        const whereORM = {
            type: {
                in: filter_type
            },
            ...(typeof filter_admin_id !== "undefined" ? {
                admin_id: filter_admin_id
            } : {}),
            ...(typeof name !== "undefined" ? {
                name: {
                    contains: name
                }
            } : {}),
            ...(typeof username !== "undefined" ? {
                username: {
                    contains: username
                }
            } : {})
        }

        const includeORM = include_admin
            ? {
                include: {
                    userAdmin: {
                        select: {
                            id: true,
                            isAutoApprove: true,
                            autoApproveTime: true,
                            checkOutGracePeriod: true,
                            isStaffAllowedToApprove: true,
                            isStaffAllowedToForceCheckout: true,
                            isStaffAllowedToDismissCall: true
                        }
                    }
                }
            }
            : undefined

        const [users, usersCount] = await Promise.all([
            this.prisma.adminUsers.findMany({
                where: whereORM,
                ...includeORM,
                select: include_admin ? undefined : {
                    id: true,
                    admin_id: true,
                    type: true,
                    name: true,
                    username: true,
                    createdAt: true
                },
                orderBy: {
                    [order_by]: order
                },
                skip: skip,
                take: limit
            }),
            this.prisma.adminUsers.count({
                where: whereORM
            })
        ])

        return {
            data: users,
            meta: {
                page,
                order,
                order_by,
                has_page_before: page !== 1,
                has_page_after: skip + limit < usersCount,
                page_end: Math.ceil(usersCount / limit)
            }
        }
    }

    async getSettings(request: RequestWithJWTPayload) {
        const adminSettings = await this.prisma.admin.findUnique({
            where: { id: 1 }
        })
        if (!adminSettings) throw new InternalServerErrorException()

        return {
            is_auto_approve: adminSettings.isAutoApprove,
            auto_approve_time: adminSettings.autoApproveTime,
            smart_door_default_pin: adminSettings.smartDoorDefaultPin,
            checkout_grace_period: adminSettings.checkOutGracePeriod,
            is_staff_allowed_to_approve: adminSettings.isStaffAllowedToApprove,
            is_staff_allowed_to_force_checkout: adminSettings.isStaffAllowedToForceCheckout,
            is_staff_allowed_to_dissmiss_call: adminSettings.isStaffAllowedToDismissCall
        }
    }

    async dismissCall(dismissCallDto: DismissCallDto, request: RequestWithJWTPayload) {
        // grab the booking specified by user
        const booking = await this.prisma.bookings.findUnique({
            where: { 
                id: dismissCallDto.booking_id,
                isInnkeeperCalled: true
            },
        })
        if (!booking) throw new NotFoundException()
        
        // grab the admin users that turned off the call
        const admin = await this.prisma.adminUsers.findUnique({
            where: { id: request.user.id }
        })
        if (!admin) throw new UnauthorizedException()

        // turn off the call
        await this.prisma.bookings.update({
            where: { id: booking.id },
            data: { isInnkeeperCalled: false }
        })

        // make a web notifications
        await this.prisma.bookingsNotifications.create({
            data: {
                booking_id: booking.id,
                title: `${admin.name} has Served to Your Room`,
                description: dismissCallDto.message ?? "Thank you for calling and trusting our staff, don't be shy to call again."
            }
        })
    }

    // async forceCheckout()
}
