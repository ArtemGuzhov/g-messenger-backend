import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { environment } from 'src/environment'
import { JwtPayload } from '../interfaces/jwt-payload.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environment.tokenKeys.accessKey,
    })
  }

  async validate(payload?: JwtPayload): Promise<JwtPayload> {
    if (!payload) {
      throw new UnauthorizedException()
    }
    return payload
  }
}
