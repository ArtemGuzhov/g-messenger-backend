import { InputType, IntersectionType, PartialType } from '@nestjs/graphql'
import { EmailInput } from 'src/shared/graphql/inputs/email.input'
import { UuidInput } from 'src/shared/graphql/inputs/uuid.input'

@InputType()
export class GetUserInput extends IntersectionType(
  PartialType(EmailInput),
  PartialType(UuidInput),
) {}
