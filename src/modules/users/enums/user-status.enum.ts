import { registerEnumType } from '@nestjs/graphql'

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}
registerEnumType(UserStatus, {
  name: 'UserStatus',
})
