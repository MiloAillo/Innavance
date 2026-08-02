// src/booking/booking.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BookingsService } from 'src/bookings/bookings.service';
import { PrismaService } from 'src/prisma/prisma.service';

// queue that automatically switch on-hold to checked-in when autoApprove is on and time is set to more than 0
  @Processor('booking-queue')
  export class BookingsProcessor extends WorkerHost {
    constructor(
      private readonly bookingsService: BookingsService
    ) { 
      super()
    }

  // This method runs automatically when the delay reaches zero
  async process(job: Job<{ room_name: string, room_id: number, phone_number: string }>): Promise<void> {

    switch (job.name) {
      case 'auto-checkin': {
        const { room_name, room_id, phone_number } = job.data
        
        // 1. trigger checkedIn inside bookingsService
        await this.bookingsService.checkedIn(room_name, room_id, phone_number)

        break
      }
    }

  }
}