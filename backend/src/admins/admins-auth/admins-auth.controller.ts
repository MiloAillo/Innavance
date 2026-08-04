import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AdminsAuthService } from './admins-auth.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { JwtAuthGuard } from '../guard/jwt-auth-guard.guard';

@Controller('admins/auth')
export class AdminsAuthController {
    constructor(private readonly adminsAuthService: AdminsAuthService) {}

    // POST admins/auth     =>      used for admin login, return refresh token and active token
    @Post()
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {   // decorate the loginDto with the validated object as specified in the dto/login.dto.ts
        const tokens = await this.adminsAuthService.login(loginDto)

        return { ...tokens }
    }

    // POST admins/auth/refresh      =>      used to get a new active token using if expired using refresh token
    @Post('refresh')
    async refresh(@Body() refreshDto: RefreshDto) {   // decorate the refreshDto with the validated object as specified in the dto/refresh.dto.ts
        const activeToken = await this.adminsAuthService.refresh(refreshDto)

        return { activeToken }
    }

    // DELETE admins/auth           =>      used for admin logout, remove refresh token
    @Delete()
    @UseGuards(JwtAuthGuard)  // middleware to intercept request body, parse active token, and append it to the body as user
    async delete(@Req() request: Request) {
        await this.adminsAuthService.delete(request)

        return { message: "logged out" }
    }
}
