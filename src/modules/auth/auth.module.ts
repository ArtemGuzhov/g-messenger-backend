import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { environment } from '../../shared/environment'
import { UsersModule } from '../users/users.module'
import { AuthControllerV1 } from './controllers/auth.controller.v1'
import { AuthService } from './services/auth.service'
import { AccessTokenStrategy } from './strategies/access-token.strategy'
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy'
import { WsAccessTokenStrategy } from './strategies/ws-access-token.strategy'

@Module({
  imports: [
    JwtModule.register({
      secret: environment.tokenKeys.accessKey,
    }),
    UsersModule,
  ],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    WsAccessTokenStrategy,
  ],
  controllers: [AuthControllerV1],
  exports: [AuthService],
})
export class AuthModule {}
