import { ForbiddenException, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { RedisManagerService } from 'src/modules/redis-manager/services/redis-manager.service'

import { environment } from '../../../shared/environment'
import { IJwtPayload } from '../services/interfaces/jwt-payload.interface'

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly redisManagerService: RedisManagerService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: environment.tokenKeys.accessKey,
    })
  }

  async validate(payload: IJwtPayload): Promise<IJwtPayload> {
    const refreshToken = await this.redisManagerService.get(
      `${payload.userId}-refresh-token`,
    )

    if (refreshToken === null) {
      throw new ForbiddenException('You are logged out. Log in again.')
    }

    return payload
  }
}
