import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import * as dashboardGuard from './guard/dashboard.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(dashboardGuard.DashboardGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    // GET /dashboard/:id/check      =>      endpoint to give client an OK response if the guard pass
    @Get(':id/check')
    
    async check() {
        return null
    }

    @Get(':id')
    async view(@Req() request: dashboardGuard.RequestWithRoomData) {
        const data = await this.dashboardService.view(request)

        return data
    }

    // add ability to call for innkeeper
    

    // notification pull in the guard might not be createdAt descending ordered
}
