import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AdminsAuthModule } from './admins/admins-auth/admins-auth.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { BullModule } from "@nestjs/bullmq"
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
    AdminsAuthModule,
    PrismaModule,
    RoomsModule,
    BookingsModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
