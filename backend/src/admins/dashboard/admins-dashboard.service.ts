import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { RequestWithJWTPayload } from '../guard/jwt-auth-guard.guard';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminsDashboardService {
    constructor(private readonly prisma: PrismaService) {}

    async getUserInfo(request: RequestWithJWTPayload) {
        // grab the user data from db according to the parsed token specified
        const user = await this.prisma.adminUsers.findUnique({
            where: { id: request.user.id },
            select: {
                id: true,
                name: true,
                type: true,
                username: true
            }
        })
        if (!user) throw new UnauthorizedException()

        return user
    }

    // async getApprovalNeededRooms(request: RequestWithJWTPayload) {
    //     // grab the room that need approval
    //     const approvalNeededRooms = await this.prisma.rooms.findMany({
    //         where: {
    //             bookings: {
    //                 some: {
    //                     status: "on_hold"
    //                 }
    //             }
    //         },
    //         select: {
    //             name: true,
    //             capacity: true,

    //         }
    //     })

    //     // if admin is a staff and check their permission first
    //     if (request.user.type === "staff") {
    //         const adminSettings = await this.prisma.admin.findUnique({
    //             where: { id: 1 },
    //             select: {
    //                 isStaffAllowedToApprove: true,
    //                 isStaffAllowedToDismissCall: true,
    //                 isStaffAllowedToForceCheckout: true
    //             }
    //         })
    //         if (!adminSettings) throw new InternalServerErrorException()
            
            
    //     }
    // }
}
