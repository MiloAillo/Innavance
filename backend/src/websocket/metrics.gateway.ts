import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

interface AdminJwtPayload {
  id: number;
  username: string;
  type: 'manager' | 'staff';
}

type JwtPayload = AdminJwtPayload | { accountId: string; type: 'user' };

interface MetricsData {
  roomId: number;
  accountId: string | null;
  smartDoorIsLocked: boolean;
  smartDoorIsOpened: boolean;
  electricityOutput: number;
  waterOutput: number;
  isInnkeeperCalled: boolean;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'metrics',
})
@Injectable()
export class MetricsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MetricsGateway.name);
  private readonly connectedClients = new Map<
    string,
    { socket: Socket; payload: JwtPayload }
  >();
  private readonly updateIntervals = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromSocket(client);
      if (!token) {
        client.disconnect();
        return;
      }

      let payload: JwtPayload;

      try {
        // First try to verify as JWT (for admins)
        const verifiedPayload = this.jwtService.verify<AdminJwtPayload>(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });

        // Validate admin payload structure
        if (!this.isValidAdminPayload(verifiedPayload)) {
          throw new UnauthorizedException('Invalid admin token structure');
        }

        payload = verifiedPayload;
      } catch (jwtError) {
        // If JWT verification fails, treat as plain accountId (for users)
        // Validate accountId exists in database
        const isValidAccountId = await this.validateAccountId(token);
        if (!isValidAccountId) {
          throw new UnauthorizedException('Invalid accountId');
        }

        payload = {
          accountId: token,
          type: 'user',
        };
      }

      this.connectedClients.set(client.id, { socket: client, payload });
      this.logger.log(
        `Client connected: ${client.id}, user: ${this.getUserIdentifier(payload)}`,
      );

      // Send initial metrics based on user type
      await this.sendInitialMetrics(client, payload);

      // Start periodic updates
      this.startPeriodicUpdates(client, payload);
    } catch (error: any) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      this.logger.log(
        `Client disconnected: ${client.id}, user: ${this.getUserIdentifier(clientData.payload)}`,
      );
      this.connectedClients.delete(client.id);

      // Clear update interval
      const intervalId = this.updateIntervals.get(client.id);
      if (intervalId) {
        clearInterval(intervalId);
        this.updateIntervals.delete(client.id);
      }
    }
  }

  private extractTokenFromSocket(client: Socket): string | null {
    let token =
      client.handshake.auth?.token || client.handshake.headers?.authorization;
    if (!token) return null;

    // Remove 'Bearer ' prefix if present
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }

    return token;
  }

  private async sendInitialMetrics(client: Socket, payload: JwtPayload) {
    try {
      let metrics: MetricsData[] = [];

      if (this.isValidAdminPayload(payload)) {
        // Admin: get all rooms
        metrics = await this.getAllRoomsMetrics();
      } else if (this.isUserAccountIdPayload(payload)) {
        // User: get their specific room
        const roomMetric = await this.getRoomMetricsByAccountId(
          payload.accountId,
        );
        if (roomMetric) {
          metrics = [roomMetric];
        }
      }

      if (metrics.length > 0) {
        client.emit('metrics:initial', metrics);
      }
    } catch (error: any) {
      this.logger.error(`Error sending initial metrics: ${error.message}`);
    }
  }

  private async getAllRoomsMetrics(): Promise<MetricsData[]> {
    const rooms = await this.prisma.rooms.findMany({
      select: {
        id: true,
        accountId: true,
        smartDoorIsLocked: true,
        smartDoorIsOpened: true,
        electricityOutput: true,
        waterOutput: true,
        bookings: {
          where: {
            status: 'checked_in',
          },
          select: {
            isInnkeeperCalled: true,
          },
          take: 1,
        },
      },
    });

    return rooms.map((room) => ({
      roomId: room.id,
      accountId: room.accountId,
      smartDoorIsLocked: room.smartDoorIsLocked,
      smartDoorIsOpened: room.smartDoorIsOpened,
      electricityOutput: room.electricityOutput,
      waterOutput: room.waterOutput,
      isInnkeeperCalled: room.bookings[0]?.isInnkeeperCalled ?? false,
    }));
  }

  private async getRoomMetricsByAccountId(
    accountId: string,
  ): Promise<MetricsData | null> {
    const room = await this.prisma.rooms.findFirst({
      where: { accountId },
      select: {
        id: true,
        accountId: true,
        smartDoorIsLocked: true,
        smartDoorIsOpened: true,
        electricityOutput: true,
        waterOutput: true,
        bookings: {
          where: {
            status: 'checked_in',
          },
          select: {
            isInnkeeperCalled: true,
          },
          take: 1,
        },
      },
    });

    if (!room) return null;

    return {
      roomId: room.id,
      accountId: room.accountId,
      smartDoorIsLocked: room.smartDoorIsLocked,
      smartDoorIsOpened: room.smartDoorIsOpened,
      electricityOutput: room.electricityOutput,
      waterOutput: room.waterOutput,
      isInnkeeperCalled: room.bookings[0]?.isInnkeeperCalled ?? false,
    };
  }

  private isValidAdminPayload(payload: any): payload is AdminJwtPayload {
    return (
      payload &&
      typeof payload.id === 'number' &&
      typeof payload.username === 'string' &&
      (payload.type === 'manager' || payload.type === 'staff')
    );
  }

  private isUserAccountIdPayload(
    payload: any,
  ): payload is { accountId: string; type: 'user' } {
    return (
      payload &&
      typeof payload.accountId === 'string' &&
      payload.type === 'user'
    );
  }

  private async validateAccountId(accountId: string): Promise<boolean> {
    const room = await this.prisma.rooms.findFirst({
      where: { accountId },
      select: { id: true },
    });
    return !!room;
  }

  private getUserIdentifier(payload: JwtPayload): string {
    if (this.isValidAdminPayload(payload)) {
      return `${payload.username} (${payload.type})`;
    } else if (this.isUserAccountIdPayload(payload)) {
      return `account:${payload.accountId}`;
    }
    return 'unknown';
  }

  private startPeriodicUpdates(client: Socket, payload: JwtPayload) {
    // Set interval for updates (minimum 5 seconds)
    const updateInterval = 5000; // 5 seconds

    const intervalId = setInterval(async () => {
      try {
        let metrics: MetricsData[] = [];

        if (this.isValidAdminPayload(payload)) {
          // Admin: get all rooms
          metrics = await this.getAllRoomsMetrics();
        } else if (this.isUserAccountIdPayload(payload)) {
          // User: get their specific room
          const roomMetric = await this.getRoomMetricsByAccountId(
            payload.accountId,
          );
          if (roomMetric) {
            metrics = [roomMetric];
          }
        }

        if (metrics.length > 0) {
          client.emit('metrics:update', metrics);
        }
      } catch (error: any) {
        this.logger.error(`Error in periodic update: ${error.message}`);
      }
    }, updateInterval);

    this.updateIntervals.set(client.id, intervalId);
  }

  @SubscribeMessage('metrics:request')
  async handleMetricsRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { accountId?: string },
  ) {
    const clientData = this.connectedClients.get(client.id);
    if (!clientData) {
      throw new UnauthorizedException('Client not authenticated');
    }

    const { payload } = clientData;
    let metrics: MetricsData[] = [];

    if (this.isValidAdminPayload(payload)) {
      // Admin can optionally request specific room
      if (data.accountId) {
        const roomMetric = await this.getRoomMetricsByAccountId(data.accountId);
        if (roomMetric) {
          metrics = [roomMetric];
        }
      } else {
        // Or get all rooms
        metrics = await this.getAllRoomsMetrics();
      }
    } else if (this.isUserAccountIdPayload(payload)) {
      // User can only get their own room
      const roomMetric = await this.getRoomMetricsByAccountId(
        payload.accountId,
      );
      if (roomMetric) {
        metrics = [roomMetric];
      }
    }

    if (metrics.length > 0) {
      client.emit('metrics:response', metrics);
    }
  }
}
