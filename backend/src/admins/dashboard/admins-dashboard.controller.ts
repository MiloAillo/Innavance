import { Body, Controller, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import * as jwtAuthGuard from '../guard/jwt-auth-guard.guard';
import { AdminsDashboardService } from './admins-dashboard.service';
import { RoomQueryDto } from '../dto/room-query.dto';
import { BookingQueryDto } from '../dto/booking-query.dto';
import { AdminUsersQueryDto } from '../dto/admin-users-query.dto';
import { DismissCallDto } from '../dto/dismiss-call.dto';
import { ForceCheckoutDto } from '../dto/force-checkout.dto';
import { AddonServedDto } from '../dto/addon-served.dto';
import { approveQueueDto } from '../dto/approve-queue.dto';

@Controller('admins/dashboard')
@UseGuards(jwtAuthGuard.JwtAuthGuard)
export class AdminsDashboardController {
    constructor (private readonly adminsDasboardService: AdminsDashboardService) {}
    
    // GET admins/dashboard             =>      return the user info
    @Get()
    async getUserInfo(@Req() request: jwtAuthGuard.RequestWithJWTPayload) {
        return await this.adminsDasboardService.getUserInfo(request)
    }

    // GET admins/dashboard/rooms       =>      get paginated rooms detail and its active booking
    @Get('rooms')
    async getRooms(@Query() roomQueryDto: RoomQueryDto) {
        return await this.adminsDasboardService.getRooms(roomQueryDto)
    }

    // GET admins/dashboard/bookings   =>      get paginated bookings detail and its related room
    @Get('bookings')
    async getBookings(@Query() bookingQueryDto: BookingQueryDto) {
        return await this.adminsDasboardService.getBookings(bookingQueryDto)
    }

    // GET admins/dashboard/users      =>      get paginated admin users list
    @Get('users')
    async getAdminUsers(@Query() adminUsersQueryDto: AdminUsersQueryDto) {
        return await this.adminsDasboardService.getAdminUsers(adminUsersQueryDto)
    }

    // GET admins/dashboard/settings   =>       get the settings
    @Get('settings')
    async getSettings(@Req() request: jwtAuthGuard.RequestWithJWTPayload) {
        return await this.adminsDasboardService.getSettings(request)
    }

    // PATCH admins/dashboard/bookings/served
    @Patch('bookings/served')
    async addonServed(@Body() addonServedDto: AddonServedDto, request: jwtAuthGuard.RequestWithJWTPayload) {
        return await this.adminsDasboardService.addonServed(addonServedDto, request)
    }

    // PATCH admins/dashboard/bookings/dismiss
    @Patch('bookings/dismiss')
    async dismissCall(@Body() dismissCallDto: DismissCallDto, @Req() request: jwtAuthGuard.RequestWithJWTPayload) {
        return await this.adminsDasboardService.dismissCall(dismissCallDto, request)
    }

    // PATCH admins/dashboard/bookings/checkout
    @Patch('bookings/checkout')
    async forceCheckout(@Body() forceCheckoutDTO: ForceCheckoutDto, @Req() request: jwtAuthGuard.RequestWithJWTPayload) {
        return await this.adminsDasboardService.forceCheckout(forceCheckoutDTO, request)
    }

    // PATCH admins/dashboard/bookings/approve
    @Patch('bookings/approve')
    async approveQueue(@Body() approveQueueDto: approveQueueDto, @Req() request: jwtAuthGuard.RequestWithJWTPayload) {
        return await this.adminsDasboardService.approveQueue(approveQueueDto, request)
    }
}
