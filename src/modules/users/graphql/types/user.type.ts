import { Field, ObjectType } from '@nestjs/graphql'
import { User as IUser } from '@prisma/client'

@ObjectType()
export class UserType implements Omit<IUser, 'password'> {
  @Field(() => String)
  id: string

  @Field(() => String, { nullable: true })
  name: string | null

  @Field(() => String)
  email: string
}
