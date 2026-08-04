import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AdminsAuthModule } from './admins/admins-auth/admins-auth.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { BullModule } from "@nestjs/bullmq"
import { ScheduleModule } from '@nestjs/schedule';
import { MetricsService } from './metrics.service';
import { AdminsDashboardModule } from './admins/dashboard/admins-dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({        // load .env globally across the app
      isGlobal: true
    }), 
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379
      }
    }),
    ScheduleModule.forRoot(),
    AdminsAuthModule,
    PrismaModule,
    RoomsModule,
    BookingsModule,
    AdminsDashboardModule,
  ],
  controllers: [],
  providers: [PrismaService, MetricsService],
})
export class AppModule {}
