import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { JwtPayload } from '../services/interfaces/jwt-payload.interface'

export const GetRefreshToken = createParamDecorator(
  (data: keyof JwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    if (!data) {
      return request.user
    }

    return request.user[data]
  },
)
