import { ForbiddenException, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { environment } from '../../../shared/environment'
import { JwtPayload } from '../services/interfaces/jwt-payload.interface'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('refresh-token'),
      secretOrKey: environment.tokenKeys.refreshKey,
      passReqToCallback: true,
    })
  }

  validate(req: Request, payload: JwtPayload): JwtPayload {
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
