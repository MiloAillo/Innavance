import { Module } from '@nestjs/common';
import { AdminsDashboardService } from './admins-dashboard.service';
import { AdminsDashboardController } from './admins-dashboard.controller';
import { AdminsAuthModule } from '../admins-auth/admins-auth.module';

@Module({
  imports: [AdminsAuthModule],
  providers: [AdminsDashboardService],
  controllers: [AdminsDashboardController]
})
export class AdminsDashboardModule {}
