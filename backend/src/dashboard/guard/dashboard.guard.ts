 import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { Prisma } from 'src/generated/prisma/client';

type RoomWithBookings = Prisma.RoomsGetPayload<{
  include: { 
    bookings: { 
      where: { status: 'checked_in' },
      include: {
        bookingsNotifications: {
          take: 5
        }
      }
    } 
  }
}>

export interface RequestWithRoomData extends Request {
  data: RoomWithBookings
}

@Injectable()
export class DashboardGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    // switch to http context to intercept request
    const request = context.switchToHttp().getRequest<RequestWithRoomData>()

    // grab the id url param
    const roomId = request.params.id
    if (!roomId) throw new UnauthorizedException("room id is missing in url param")
    if (typeof roomId === "object") throw new BadRequestException("room id request is broken")
    
    let parsedRoomId = parseInt(roomId)
    if (Number.isNaN(parsedRoomId)) throw new BadRequestException("room id must be a number")

    // grab the accountId in the authorization header
    const accountId = this.extractTokenFromHeader(request)
    if (!accountId) throw new UnauthorizedException("accountId is missing")

    // grab the room that match the id and accountId, and have a booking that has checked_in status
    const room = await this.prisma.rooms.findUnique({
      where: {
        id: parsedRoomId,
        accountId: accountId,
        bookings: {
          some: {
            status: "checked_in"
          }
        }
      },
      include: {
        bookings: {
          where: { status: "checked_in" },
          include: {
            bookingsNotifications: {
              take: 5
            }
          }
        },
      }
    })
    console.log(room)
    if (!room) throw new UnauthorizedException("no active booking found")

    request.data = room
  
    return true
  }

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers["authorization"]?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
