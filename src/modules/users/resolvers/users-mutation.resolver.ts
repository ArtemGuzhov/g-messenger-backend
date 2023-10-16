import { Mutation, Resolver } from '@nestjs/graphql'
import { UserType } from '../graphql/types/user.type'
// import { UsersService } from '../services/users.service'

@Resolver(() => UserType)
export class UserMutationResolver {
  //   constructor(private readonly usersService: UsersService) {}

  @Mutation(() => UserType)
  async user(): Promise<UserType> {
    return {} as UserType
  }
}
