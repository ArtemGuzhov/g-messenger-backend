import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { UserQueriesType } from '../graphql/types/user-queries.type'
import { UserType } from '../graphql/types/user.type'
import { GetUserInput } from '../graphql/inputs/get-user.input'
import { UsersService } from '../services/users.service'
import { UseGuards } from '@nestjs/common'
import { JwtGuard } from 'src/modules/auth/guards/jwt.guard'

@Resolver(() => UserQueriesType)
export class UsersQueriesResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserQueriesType)
  async user(): Promise<UserQueriesType> {
    return {}
  }

  @UseGuards(JwtGuard)
  @ResolveField(() => UserType)
  async getUser(
    @Parent() _parent: UserQueriesType,
    @Args('input') input: GetUserInput,
  ): Promise<UserType> {
    return this.usersService.getUser(input)
  }
}
