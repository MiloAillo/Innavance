import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleStuckCheckouts() {
    this.logger.log('Running stuck checkout cleanup job...');

    try {
      const now = new Date();

      const stuckBookings = await this.prisma.bookings.findMany({
        where: {
          status: 'checking_out',
        },
        include: {
          bookingsAddons: true,
          bookingRoom: true,
        },
      });

      if (stuckBookings.length === 0) {
        this.logger.log('No stuck bookings found');
        return;
      }

      this.logger.log(`Found ${stuckBookings.length} bookings in checking_out status`);

      for (const booking of stuckBookings) {
        const graceTimeMinutes = booking.checkoutGraceTime || 0;
        const updatedAt = booking.updatedAt || booking.createdAt;
        const graceExpiry = new Date(updatedAt.getTime() + graceTimeMinutes * 60 * 1000);

        if (now >= graceExpiry) {
          this.logger.warn(
            `Processing stuck booking #${booking.id} (grace period expired ${Math.floor((now.getTime() - graceExpiry.getTime()) / 1000 / 60)} minutes ago)`,
          );

          try {
            const adminSettings = await this.prisma.admin.findUnique({
              where: { id: 1 },
            });

            if (!adminSettings) {
              this.logger.error('Admin settings not found, skipping booking #${booking.id}');
              continue;
            }

            await this.prisma.bookings.update({
              where: { id: booking.id },
              data: {
                status: 'checked_out',
                checkedOutAt: new Date(),
                checkoutGraceTime: null,
              },
            });

            await this.prisma.rooms.update({
              where: { id: booking.room_id },
              data: {
                smartDoorPin: adminSettings.smartDoorDefaultPin,
                accountId: null,
                isAvailable: true,
              },
            });

            for (const bookingAddon of booking.bookingsAddons) {
              await this.prisma.addons.update({
                where: { id: bookingAddon.addon_id },
                data: {
                  currentlyBorrowed: {
                    decrement: bookingAddon.count,
                  },
                },
              });
            }

            this.logger.log(
              `Successfully cleaned up booking #${booking.id} for room ${booking.bookingRoom.name}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to clean up booking #${booking.id}: ${error.message}`,
            );

            await this.prisma.adminNotifications.create({
              data: {
                admin_id: 1,
                type: 'important',
                title: 'Automatic Cleanup Failed',
                description: `Failed to cleanup stuck booking #${booking.id}. Manual intervention required.`,
              },
            });
          }
        } else {
          const remainingMinutes = Math.ceil(
            (graceExpiry.getTime() - now.getTime()) / 1000 / 60,
          );
          this.logger.debug(
            `Booking #${booking.id} still in grace period (${remainingMinutes} minutes remaining)`,
          );
        }
      }

      this.logger.log('Stuck checkout cleanup job completed');
    } catch (error) {
      this.logger.error(`Cleanup job failed: ${error.message}`);
    }
  }
}
