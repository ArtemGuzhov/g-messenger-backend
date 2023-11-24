import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { IJwtPayload } from '../services/interfaces/jwt-payload.interface'

export const GetJwtPayload = createParamDecorator(
  (_: undefined, context: ExecutionContext): IJwtPayload => {
    const request = context.switchToHttp().getRequest()

    const user = request.user as IJwtPayload
    return user
  },
)
