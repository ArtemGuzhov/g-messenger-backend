import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { UserType } from '../graphql/types/user.type'
import { UsersService } from '../services/users.service'

@Resolver(() => UserType)
export class UsersQueryResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserType)
  async user(): Promise<UserType> {
    return {} as UserType
  }

  @ResolveField(() => UserType, { nullable: true })
  async getById(
    @Parent() _user: UserType,
    @Args('id', { type: () => String }) id: string,
  ): Promise<UserType | null> {
    return this.usersService.getById(id)
  }
}
