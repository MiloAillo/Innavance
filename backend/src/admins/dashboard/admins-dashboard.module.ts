import { Module } from '@nestjs/common';
import { AdminsDashboardService } from './admins-dashboard.service';
import { AdminsDashboardController } from './admins-dashboard.controller';
import { AdminsAuthModule } from '../admins-auth/admins-auth.module';
import { BullModule } from '@nestjs/bullmq';
import { AdminDasboardProcessor } from './admins-dashboard.processor';
import { EncryptionService } from 'src/helper/encryption.service';

@Module({
  imports: [
    BullModule.registerQueue({
      // register bullMQ queue
      name: 'admin-booking-queue',
    }),
    AdminsAuthModule,
  ],
  providers: [AdminsDashboardService, AdminDasboardProcessor, EncryptionService],
  controllers: [AdminsDashboardController],
})
export class AdminsDashboardModule {}
