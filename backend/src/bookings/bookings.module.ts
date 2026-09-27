import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsProcessor } from './bookings.processor';
import { BullModule } from '@nestjs/bullmq';
import { EncryptionService } from '../helper/encryption.service';
import { AdminsAuthModule } from '../admins/admins-auth/admins-auth.module';

@Module({
  imports: [
    BullModule.registerQueue({
      // register bullMQ queue
      name: 'booking-queue',
    }),
    AdminsAuthModule, // Import the properly configured JWT module
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsProcessor, EncryptionService],
})
export class BookingsModule {}
