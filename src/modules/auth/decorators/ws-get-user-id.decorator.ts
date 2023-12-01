import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { JwtPayload } from '../services/interfaces/jwt-payload.interface'

export const WsGetUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): string => {
    const handshake = context.switchToWs().getClient().handshake

    const user = handshake.user as JwtPayload
    return user.userId
  },
)
