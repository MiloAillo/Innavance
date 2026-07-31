import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AdminsAuthModule } from './admins/admins-auth/admins-auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({        // load .env globally across the app
      isGlobal: true
    }), 
    AdminsAuthModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
