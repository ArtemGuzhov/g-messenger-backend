import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'
import { EmailInput } from 'src/shared/graphql/inputs/email.input'

@InputType()
export class SingInInput extends EmailInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  password: string
}
