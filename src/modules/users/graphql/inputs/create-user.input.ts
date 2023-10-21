import { InputType } from '@nestjs/graphql'
import { EmailInput } from 'src/shared/graphql/inputs/email.input'

@InputType()
export class CreateUserInput extends EmailInput {}
