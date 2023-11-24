import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { RedisManagerService } from 'src/modules/redis-manager/services/redis-manager.service'
import { UsersService } from 'src/modules/users/services/users.service'
import { environment } from 'src/shared/environment'

import { CryptoService } from '../../crypto/services/crypto.service'
import { SignInDTO } from '../controllers/dto/sign-in.dto'
import { AuthRTO } from '../controllers/rto/auth.rto'
import { IJwtPayload } from './interfaces/jwt-payload.interface'
import { ITokens } from './interfaces/tokens.interface'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly redisManagerService: RedisManagerService,
  ) {}

  async signIn(payload: SignInDTO): Promise<AuthRTO> {
    const { email, password } = payload
    const user = await this.usersService.getUserByEmail(email).catch(() => {
      throw new UnauthorizedException()
    })

    const isCompared = this.cryptoService.comparePasswordHash(
      password,
      environment.crypto.salt,
      user.password,
    )

    if (!isCompared) {
      throw new UnauthorizedException()
    }

    const tokens = await this.getTokens({
      userId: user.id,
      companyId: user.company.id,
    })

    return tokens
  }

  async logout(userId: string): Promise<void> {
    await this.redisManagerService.remove(`${userId}-refresh-token`)
  }

  async verifyJwt(jwt: string): Promise<IJwtPayload> {
    return await this.jwtService.verifyAsync(jwt, {
      secret: environment.tokenKeys.accessKey,
    })
  }

  private async getTokens(payload: {
    userId: string
    companyId: string
  }): Promise<ITokens> {
    const jwtPayload: IJwtPayload = payload

    const {
      tokenKeys: { accessKey, refreshKey },
    } = environment

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: accessKey,
        expiresIn: environment.tokenKeys.accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: refreshKey,
        expiresIn: environment.tokenKeys.refreshTokenExpiresIn,
      }),
    ])

    await this.redisManagerService.set(`${payload.userId}-refresh-token`, refreshToken)

    return {
      accessToken,
      refreshToken,
    }
  }
}
