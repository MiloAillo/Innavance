import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcrypt"
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { RefreshDto } from './dto/refresh.dto';
import { ActiveToken, JWTPayload } from '../guard/jwt-auth-guard.guard';

@Injectable()
export class AdminsAuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) {}

    async login(loginDto: LoginDto) {
        // grab adminUsers by the requested username
        const user = await this.prisma.adminUsers.findUnique({
            where: { username: loginDto.username }
        })
        if (!user) throw new UnauthorizedException()

        // compare requested password with the hashed password
        const isMatch = await bcrypt.compare(loginDto.password, user.password)
        if (!isMatch) throw new UnauthorizedException()

        // generate refresh token using UUID
        const refreshToken = randomUUID()

        // append the refresh token to the user data
        await this.prisma.adminUsers.update({
            where: { id: user.id },
            data: { refreshToken: refreshToken }
        })

        // generate active token (signed JWT token)
        const jwtPayload: JWTPayload = {
            id: user.id,
            username: user.username,
            type: user.type,
        }

        const activeToken: ActiveToken = this.jwtService.sign(jwtPayload)

        return { refreshToken, activeToken }
    }

    async refresh(refreshDto: RefreshDto) {
        // grab the user holding the refresh token
        const user = await this.prisma.adminUsers.findUnique({
            where: { refreshToken: refreshDto.refresh_token }
        })
        if (!user) throw new UnauthorizedException()

        // sign a new active token (JWT Token)
        const activeToken = this.jwtService.sign({
            id: user.id,
            username: user.username,
            type: user.type
        })

        return activeToken
    }

    async delete(request: Request) {
        const user = request['user']

        await this.prisma.adminUsers.update({
            where: { id: user.id },
            data: { refreshToken: null }
        })

        return true
    }
}
