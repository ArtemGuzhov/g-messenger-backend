import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { JwtPayload } from 'src/modules/auth/interfaces/jwt-payload.interface'

export const GetJwtPayload = createParamDecorator(
  (_: undefined, context: ExecutionContext): JwtPayload => {
    const ctx = GqlExecutionContext.create(context)
    const request = ctx.getContext().req

    const data = request.user as JwtPayload
    return data
  },
)
