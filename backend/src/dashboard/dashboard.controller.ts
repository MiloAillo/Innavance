import { Controller, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import * as dashboardGuard from './guard/dashboard.guard';
import { DashboardService } from './dashboard.service';
import { CallInnkeeperDto } from './dto/call-innkeeper.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';

@Controller('dashboard')
@UseGuards(dashboardGuard.DashboardGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // GET /dashboard/:id/check      =>      endpoint to give client an OK response if the guard pass
  @Get(':id/check')
  async check() {
    return null;
  }

  @Get(':id')
  async view(@Req() request: dashboardGuard.RequestWithRoomData) {
    const data = await this.dashboardService.view(request);

    return data;
  }

  // PATCH /dashboard/:id/call            =>      allow user to call innkeeper or cancel it
  @Patch(':id/call')
  async callInnkeeper(
    @Query() callInkeeperDto: CallInnkeeperDto,
    @Req() request: dashboardGuard.RequestWithRoomData,
  ) {
    await this.dashboardService.callInnkeeper(callInkeeperDto, request);
  }

  // GET /dashboard/:id/notifications     =>      get paginated booking notification
  @Get(':id/notifications')
  async getNotifications(
    @Query() notificationQueryDto: NotificationQueryDto,
    @Req() request: dashboardGuard.RequestWithRoomData,
  ) {
    return await this.dashboardService.getNotifications(
      notificationQueryDto,
      request,
    );
  }

  // notification pull in the guard might not be createdAt descending ordered
}
