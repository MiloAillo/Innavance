import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import * as jwtAuthGuard from '../guard/jwt-auth-guard.guard';

@Controller('admins/dashboard')
export class AdminsDashboardController {
    // GET admins/dashboard     =>      return the user info
    @Get()
    @UseGuards(jwtAuthGuard.JwtAuthGuard)
    async getUserInfo(@Req() request: jwtAuthGuard.RequestWithJWTPayload) {

    }
}
