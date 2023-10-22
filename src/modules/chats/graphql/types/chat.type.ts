import { Field, ObjectType } from '@nestjs/graphql'
import { BaseWithDeletedAtEntity } from 'src/shared/entities/base-with-deleted-at.entity'
import { ChatEntity } from '../../entities/chat.entity'
import { ChatFormat } from '../../enums/chat-format.enum'
import { UserType } from 'src/modules/users/graphql/types/user.type'
import { UserEntity } from 'src/modules/users/entities/user.entity'
import { MessageType } from 'src/modules/messages/graphql/types/message.type'
import { MessageEntity } from 'src/modules/messages/entities/message.entity'

@ObjectType()
export class ChatType
  extends BaseWithDeletedAtEntity
  implements Omit<ChatEntity, 'messages' | 'users'>
{
  @Field(() => String, { nullable: true })
  name: string | null

  @Field(() => ChatFormat)
  format: ChatFormat
}

@ObjectType()
export class ChatWithMessagesType extends ChatType {
  @Field(() => [MessageType], { nullable: true })
  messages: MessageEntity[]
}

@ObjectType()
export class ChatWithUsersType extends ChatType {
  @Field(() => [UserType])
  users: UserEntity[]
}

@ObjectType()
export class ChatWithMessagesAndUsersType extends ChatType {
  @Field(() => [MessageType])
  messages: MessageEntity[]

  @Field(() => [UserType])
  users: UserEntity[]
}
