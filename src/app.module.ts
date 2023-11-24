import { RedisModule } from '@liaoliaots/nestjs-redis'
import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'

import { redisConfig } from './config/redis.config'
import { typeOrmConfig } from './config/typeorm.config'
import { AuthModule } from './modules/auth/auth.module'
import { AccessTokenGuard } from './modules/auth/guards/access-token.guard'
import { ChatsModule } from './modules/chats/chats.module'
import { CompaniesModule } from './modules/companies/companies.module'
import { CryptoModule } from './modules/crypto/crypto.module'
import { FilesModule } from './modules/files/files.module'
import { RedisManagerModule } from './modules/redis-manager/redis-manager.module'
import { S3Module } from './modules/s3/s3.module'
import { UsersModule } from './modules/users/users.module'

@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmConfig),
    RedisModule.forRootAsync(redisConfig),
    UsersModule,
    AuthModule,
    RedisManagerModule,
    CryptoModule,
    S3Module,
    CompaniesModule,
    FilesModule,
    ChatsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
