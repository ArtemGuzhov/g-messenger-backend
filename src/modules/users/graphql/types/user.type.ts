import { Field, ObjectType } from '@nestjs/graphql'
import { BaseWithDeletedAtEntity } from 'src/shared/entities/base-with-deleted-at.entity'
import { UserEntity } from '../../entities/user.entity'
import { UserStatus } from '../../enums/user-status.enum'
import { ChatType } from 'src/modules/chats/graphql/types/chat.type'
import { ChatEntity } from 'src/modules/chats/entities/chat.entity'

@ObjectType()
export class UserType
  extends BaseWithDeletedAtEntity
  implements Omit<UserEntity, 'password' | 'messages' | 'chats'>
{
  @Field(() => String)
  email: string

  @Field(() => UserStatus)
  status: UserStatus
}

@ObjectType()
export class UserWithCathsType extends UserType {
  @Field(() => [ChatType], { nullable: true })
  chats: ChatEntity[]
}
