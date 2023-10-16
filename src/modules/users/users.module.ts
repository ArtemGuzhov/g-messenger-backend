import { Module } from '@nestjs/common'
import { UsersService } from './services/users.service'
import { UsersQueryResolver } from './resolvers/users-query.resolver'
import { UserMutationResolver } from './resolvers/users-mutation.resolver'

@Module({
  providers: [UsersService, UsersQueryResolver, UserMutationResolver],
})
export class UsersModule {}
