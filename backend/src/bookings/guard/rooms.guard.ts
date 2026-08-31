import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class RoomGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    // get the in-flight request
    const request = context.switchToHttp().getRequest<Request>();

    // extract the account id from the header
    const accountId = this.extractTokenFromHeader(request);
    if (!accountId) throw new UnauthorizedException('account id missing');

    request['accountId'] = accountId;

    return true;
  }

  // small function to parse authorization token formatted with 'bearer' prefix
  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
