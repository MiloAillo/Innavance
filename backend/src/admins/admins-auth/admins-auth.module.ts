import { Module } from '@nestjs/common';
import { AdminsAuthController } from './admins-auth.controller';
import { AdminsAuthService } from './admins-auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"

@Module({
  imports: [
    JwtModule.registerAsync({           // initialize and configure JWT to sign and verify JWT token
      imports: [ConfigModule],         
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') ?? "qK*jg%7hs)K:>",
        signOptions: { expiresIn: '15m' }
      })
    }),
  ],
  controllers: [AdminsAuthController],
  providers: [AdminsAuthService],
  exports: [JwtModule]
})
export class AdminsAuthModule {}
