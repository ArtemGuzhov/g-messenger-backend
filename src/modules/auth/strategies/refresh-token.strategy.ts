import { ForbiddenException, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { environment } from '../../../shared/environment'
import { IJwtPayload } from '../services/interfaces/jwt-payload.interface'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('refresh-token'),
      secretOrKey: environment.tokenKeys.refreshKey,
      passReqToCallback: true,
    })
  }

  validate(req: Request, payload: IJwtPayload): IJwtPayload {
    const refreshToken = req.get('refresh-token')?.trim()

    if (!refreshToken) {
      throw new ForbiddenException('Forbidden')
    }

    return {
      ...payload,
      refreshToken,
    }
  }
}
