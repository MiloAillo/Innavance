import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as jwtAuthGuard from '../guard/jwt-auth-guard.guard';
import { AdminsDashboardService } from './admins-dashboard.service';
import { RoomQueryDto } from '../dto/room-query.dto';
import { BookingQueryDto } from '../dto/booking-query.dto';
import { AdminUsersQueryDto } from '../dto/admin-users-query.dto';
import { DismissCallDto } from '../dto/dismiss-call.dto';
import { ForceCheckoutDto } from '../dto/force-checkout.dto';
import { AddonServedDto } from '../dto/addon-served.dto';
import { approveQueueDto } from '../dto/approve-queue.dto';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { UpdateStaffPermissionsDto } from '../dto/update-staff-permissions.dto';

@Controller('admins/dashboard')
@UseGuards(jwtAuthGuard.JwtAuthGuard)
export class AdminsDashboardController {
  constructor(private readonly adminsDasboardService: AdminsDashboardService) {}

  // GET admins/dashboard             =>      return the user info
  @Get()
  async getUserInfo(@Req() request: jwtAuthGuard.RequestWithJWTPayload) {
    return await this.adminsDasboardService.getUserInfo(request);
  }

  // GET admins/dashboard/rooms       =>      get paginated rooms detail and its active booking
  @Get('rooms')
  async getRooms(@Query() roomQueryDto: RoomQueryDto) {
    return await this.adminsDasboardService.getRooms(roomQueryDto);
  }

  // GET admins/dashboard/bookings   =>      get paginated bookings detail and its related room
  @Get('bookings')
  async getBookings(@Query() bookingQueryDto: BookingQueryDto) {
    return await this.adminsDasboardService.getBookings(bookingQueryDto);
  }

  // GET admins/dashboard/users      =>      get paginated admin users list
  @Get('users')
  async getAdminUsers(@Query() adminUsersQueryDto: AdminUsersQueryDto) {
    return await this.adminsDasboardService.getAdminUsers(adminUsersQueryDto);
  }

  // GET admins/dashboard/settings   =>       get the settings
  @Get('settings')
  async getSettings(@Req() request: jwtAuthGuard.RequestWithJWTPayload) {
    return await this.adminsDasboardService.getSettings(request);
  }

  // PUT admins/dashboard/settings   =>       update booking settings (manager only)
  @Put('settings')
  async updateSettings(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @Req() request: jwtAuthGuard.RequestWithJWTPayload,
  ) {
    return await this.adminsDasboardService.updateSettings(
      updateSettingsDto,
      request,
    );
  }

  // PUT admins/dashboard/settings/staff-permissions => update staff permissions (manager only)
  @Put('settings/staff-permissions')
  async updateStaffPermissions(
    @Body() updateStaffPermissionsDto: UpdateStaffPermissionsDto,
    @Req() request: jwtAuthGuard.RequestWithJWTPayload,
  ) {
    return await this.adminsDasboardService.updateStaffPermissions(
      updateStaffPermissionsDto,
      request,
    );
  }

  // PATCH admins/dashboard/bookings/served
  @Patch('bookings/served')
  async addonServed(
    @Body() addonServedDto: AddonServedDto,
    request: jwtAuthGuard.RequestWithJWTPayload,
  ) {
    return await this.adminsDasboardService.addonServed(
      addonServedDto,
      request,
    );
  }

  // PATCH admins/dashboard/bookings/dismiss
  @Patch('bookings/dismiss')
  async dismissCall(
    @Body() dismissCallDto: DismissCallDto,
    @Req() request: jwtAuthGuard.RequestWithJWTPayload,
  ) {
    return await this.adminsDasboardService.dismissCall(
      dismissCallDto,
      request,
    );
  }

  // PATCH admins/dashboard/bookings/checkout
  @Patch('bookings/checkout')
  async forceCheckout(
    @Body() forceCheckoutDTO: ForceCheckoutDto,
    @Req() request: jwtAuthGuard.RequestWithJWTPayload,
  ) {
    return await this.adminsDasboardService.forceCheckout(
      forceCheckoutDTO,
      request,
    );
  }

  // PATCH admins/dashboard/bookings/reject
  @Patch('bookings/reject')
  async rejectQueue(
    @Body() approveQueueDto: approveQueueDto,
    @Req() request: jwtAuthGuard.RequestWithJWTPayload,
  ) {
    return await this.adminsDasboardService.rejectQueue(
      approveQueueDto,
      request,
    );
  }

  // PATCH admins/dashboard/bookings/approve
  @Patch('bookings/approve')
  async approveQueue(
    @Body() approveQueueDto: approveQueueDto,
    @Req() request: jwtAuthGuard.RequestWithJWTPayload,
  ) {
    return await this.adminsDasboardService.approveQueue(
      approveQueueDto,
      request,
    );
  }

  // POST admins/dashboard/users => create staff (manager only)
  @Post('users')
  async createStaff(
    @Body() createStaffDto: CreateStaffDto,
    @Req() request: jwtAuthGuard.RequestWithJWTPayload,
  ) {
    return await this.adminsDasboardService.createStaff(
      createStaffDto,
      request,
    );
  }

  // DELETE admins/dashboard/users/:id => delete staff (manager only)
  @Delete('users/:id')
  async deleteStaff(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: jwtAuthGuard.RequestWithJWTPayload,
  ) {
    return await this.adminsDasboardService.deleteStaff(id, request);
  }
}
