import { Field, ObjectType } from '@nestjs/graphql'
import { BaseWithDeletedAtEntity } from 'src/shared/entities/base-with-deleted-at.entity'
import { MessageEntity } from '../../entities/message.entity'
import { ChatType } from 'src/modules/chats/graphql/types/chat.type'
import { ChatEntity } from 'src/modules/chats/entities/chat.entity'
import { UserType } from 'src/modules/users/graphql/types/user.type'
import { UserEntity } from 'src/modules/users/entities/user.entity'

@ObjectType()
export class MessageType extends BaseWithDeletedAtEntity implements MessageEntity {
  @Field(() => String)
  text: string

  @Field(() => String)
  chatId: string

  @Field(() => ChatType)
  chat: ChatEntity

  @Field(() => String)
  userId: string

  @Field(() => UserType)
  user: UserEntity
}
