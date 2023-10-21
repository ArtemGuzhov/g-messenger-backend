import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { AuthService } from '../services/auth.service'
import { TokensType } from '../graphql/types/tokens.type'
import { SingInInput } from '../graphql/inputs/sign-in.input'
import { IsPublic } from 'src/shared/decorators/is-public.decorator'
import { AuthQueriesType } from '../graphql/types/auth-queries.type'

@Resolver(() => AuthQueriesType)
export class AuthQueriesResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => AuthQueriesType)
  async auth(): Promise<AuthQueriesType> {
    return {} as AuthQueriesType
  }

  @IsPublic()
  @ResolveField(() => TokensType)
  async signIn(
    @Parent() _auth: AuthQueriesType,
    @Args('input') input: SingInInput,
  ): Promise<TokensType> {
    return this.authService.signIn(input)
  }
}
