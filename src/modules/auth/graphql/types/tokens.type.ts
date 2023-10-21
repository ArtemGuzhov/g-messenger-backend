import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class TokensType {
  @Field(() => String)
  accessToken: string

  @Field(() => String)
  refreshToken: string
}
