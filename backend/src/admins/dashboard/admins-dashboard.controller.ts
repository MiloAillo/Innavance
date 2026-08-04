import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import * as jwtAuthGuard from '../guard/jwt-auth-guard.guard';
import { AdminsDashboardService } from './admins-dashboard.service';
import { RoomQueryDto } from '../admins-auth/dto/room-query.dto';

@Controller('admins/dashboard')
export class AdminsDashboardController {
    constructor (private readonly adminsDasboardService: AdminsDashboardService) {}
    
    // GET admins/dashboard             =>      return the user info
    @Get()
    @UseGuards(jwtAuthGuard.JwtAuthGuard)
    async getUserInfo(@Req() request: jwtAuthGuard.RequestWithJWTPayload) {
        return await this.adminsDasboardService.getUserInfo(request)
    }

    // GET admins/dashboard/rooms       =>      get paginated rooms detail and its active booking
    @Get('rooms')
    async getRooms(@Query() roomQueryDto: RoomQueryDto) {
        return await this.adminsDasboardService.getRooms(roomQueryDto)
    }
}
