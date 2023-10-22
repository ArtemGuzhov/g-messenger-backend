import { Module } from '@nestjs/common'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UsersModule } from '../users/users.module'
import { JwtModule } from '@nestjs/jwt'
import { environment } from 'src/environment'
import { AuthQueriesResolver } from './resolvers/auth-queries.resolver'
import { AuthService } from './services/auth.service'

@Module({
  imports: [
    JwtModule.register({
      secret: environment.tokenKeys.accessKey,
    }),
    UsersModule,
  ],
  providers: [JwtStrategy, AuthService, AuthQueriesResolver],
})
export class AuthModule {}
