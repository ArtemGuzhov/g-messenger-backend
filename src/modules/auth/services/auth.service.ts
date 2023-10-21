import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from 'src/modules/users/services/users.service'
import { SingInInput } from '../graphql/inputs/sign-in.input'
import { environment } from 'src/environment'
import { JwtPayload } from '../interfaces/jwt-payload.interface'
import { JwtService } from '@nestjs/jwt'
import { TokensType } from '../graphql/types/tokens.type'
import { UsersEntity } from 'src/modules/users/entities/users.entity'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(payload: SingInInput): Promise<TokensType> {
    const user = await this.usersService.checkPassForUser(payload).catch(() => null)

    if (user === null) {
      throw new UnauthorizedException()
    }

    const tokens = this.getTokens(user)
    // TODO: add save refreshToken in redis

    return tokens
  }

  private async getTokens(user: UsersEntity): Promise<TokensType> {
    const jwtPayload: JwtPayload = {
      id: user.id,
    }

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

    return {
      accessToken,
      refreshToken,
    }
  }
}
