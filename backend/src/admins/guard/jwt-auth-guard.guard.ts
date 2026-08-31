import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export type JWTPayload = {
  id: number;
  username: string;
  type: 'manager' | 'staff';
};

export type ActiveToken = string;

export interface RequestWithJWTPayload extends Request {
  user: JWTPayload;
  activeToken: ActiveToken;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  // guard or middleware whose job is to parse active token (JWT Token) or throw unauthorized exception if its invalid
  canActivate(context: ExecutionContext) {
    // get the in-flight request
    const request = context.switchToHttp().getRequest<RequestWithJWTPayload>();

    // extract the active token from the header
    const activeToken = this.extractTokenFromHeader(request);
    if (!activeToken) throw new UnauthorizedException('Active token missing');

    try {
      // parse the active token
      const payload = this.jwtService.verify(activeToken);

      // append the payload to the request body as user
      request.user = payload;

      // append the activeToken to the request body as activeToken
      request.activeToken = activeToken;
    } catch (error) {
      // throw 401 response if token is invalid
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  // small function to parse authorization token formatted with 'bearer' prefix
  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
