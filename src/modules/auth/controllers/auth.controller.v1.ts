import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { GetJwtPayload } from '../decorators/get-jwt-payload.decorator'
import { IsPublic } from '../decorators/is-public.decorator'
import { AuthService } from '../services/auth.service'
import { IJwtPayload } from '../services/interfaces/jwt-payload.interface'
import { SignInDTO } from './dto/sign-in.dto'
import { AuthRTO, OneAuthRTO } from './rto/auth.rto'

@ApiTags('Auth')
@ApiBearerAuth('JWT-auth')
@Controller({
  version: '1',
  path: 'auth',
})
export class AuthControllerV1 {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Парсинг токена' })
  @HttpCode(HttpStatus.OK)
  @Get('validate')
  async validate(@GetJwtPayload() jwtPayload: IJwtPayload): Promise<IJwtPayload> {
    return jwtPayload
  }

  @ApiOperation({ summary: 'Авторизация' })
  @ApiResponse({ type: OneAuthRTO })
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() body: SignInDTO): Promise<AuthRTO> {
    return await this.authService.signIn(body)
  }

  @ApiOperation({ summary: 'Завершения сеанса' })
  @HttpCode(HttpStatus.OK)
  @Patch('logout')
  async logout(@GetJwtPayload() jwtPayalod: IJwtPayload): Promise<void> {
    return await this.authService.logout(jwtPayalod.userId)
  }

  // @ApiOperation({ summary: 'Обновления токенов' })
  // @ApiHeader({ name: 'Refresh-Token' })
  // @ApiResponse({ type: OneAuthRTO })
  // @IsPublic()
  // @UseGuards(RefreshTokenGuard)
  // @HttpCode(HttpStatus.OK)
  // @Patch('refresh-token')
  // async refreshTokens(
  //   @GetJwtPayload() id: string,
  //   @GetRefreshToken('refreshToken') refreshToken: string,
  // ): Promise<AuthRTO> {
  //   return await this.jwtTokensService.refreshTokens(id, refreshToken)
  // }
}
