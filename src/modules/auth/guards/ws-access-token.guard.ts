import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class WsAccessTokenGuard extends AuthGuard('ws-jwt') {
  constructor() {
    super()
  }

  getRequest(context: ExecutionContext): void {
    return context.switchToWs().getClient().handshake
  }
}
