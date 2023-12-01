import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { JwtPayload } from '../services/interfaces/jwt-payload.interface'

export const GetJwtPayload = createParamDecorator(
  (_: undefined, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest()

    const user = request.user as JwtPayload
    return user
  },
)
