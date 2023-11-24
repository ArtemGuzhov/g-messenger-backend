import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { IJwtPayload } from '../services/interfaces/jwt-payload.interface'

export const WsGetUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): string => {
    const handshake = context.switchToWs().getClient().handshake

    const user = handshake.user as IJwtPayload
    return user.userId
  },
)
