import { ChatEntity } from 'src/modules/chats/entities/chat.entity'
import { UserEntity } from 'src/modules/users/entities/user.entity'
import { BaseWithDeletedAtEntity } from 'src/shared/entities/base-with-deleted-at.entity'
import { Column, Entity, ManyToOne } from 'typeorm'

@Entity('messages')
export class MessageEntity extends BaseWithDeletedAtEntity {
  @Column({ type: 'text' })
  text: string

  @Column({ type: 'uuid' })
  chatId: string

  @ManyToOne(() => ChatEntity, (chat) => chat.messages)
  chat: ChatEntity

  @Column({ type: 'uuid' })
  userId: string

  @ManyToOne(() => UserEntity, (user) => user.messages)
  user: UserEntity
}
