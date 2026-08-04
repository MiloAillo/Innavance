import { Module } from '@nestjs/common';
import { AdminsDashboardService } from './admins-dashboard.service';
import { AdminsDashboardController } from './admins-dashboard.controller';

@Module({
  providers: [AdminsDashboardService],
  controllers: [AdminsDashboardController]
})
export class AdminsDashboardModule {}
