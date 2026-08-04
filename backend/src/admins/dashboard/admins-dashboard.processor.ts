import { Processor, WorkerHost } from "@nestjs/bullmq";
import { InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import { Job } from "bullmq";
import { BookingsService } from "src/bookings/bookings.service";
import { PrismaService } from "src/prisma/prisma.service";

@Processor('admin-booking-queue')
export class AdminDasboardProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) { super() }

  // This method runs automatically when the delay reaches zero
  async process(job: Job<{ room_name: string, room_id: number, phone_number: string, booking_id: number }>): Promise<void> {

    switch (job.name) {
      case 'force_auto_checkout': {
        const { room_name, room_id, phone_number, booking_id } = job.data
        
        // grab the admin settings
        const adminSettings = await this.prisma.admin.findUnique({
            where: { id: 1 }
        })
        if (!adminSettings) throw new InternalServerErrorException()
        
        // update the booking to checked out 
        await this.prisma.bookings.update({
            where: { id: booking_id },
            data: { status: "checked_out" }
        })

        // rotate the door PIN to the default value and remove the accountId
        await this.prisma.rooms.update({
            where: { id: room_id },
            data: {
                smartDoorPin: adminSettings.smartDoorDefaultPin,
                accountId: null,
                isAvailable: true
            }
        })

        // notify the client
        await axios.post(`${process.env.WHATSAPP_SERVICE_URL ?? "http://localhost:3001" }/send`, {
            phone_number: phone_number,
            message: `You has been forced to checked out from ${room_name} at Innavance.\nThe door PIN and Dashboard is now unusable.\nWe are aware of our decision and we are very sorry for it to be this way. 😉\n`
        }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })

        break
      }
    }
  }
}
