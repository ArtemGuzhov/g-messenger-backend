import { Module } from '@nestjs/common'
import { UsersService } from './services/users.service'
import { UsersQueriesResolver } from './resolvers/users-queries.resolver'

@Module({
  providers: [UsersService, UsersQueriesResolver],
  exports: [UsersService],
})
export class UsersModule {}
