import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsProcessor } from './bookings.processor';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({      // register bullMQ queue
      name: 'booking-queue'
    })
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsProcessor],
})
export class BookingsModule {}
