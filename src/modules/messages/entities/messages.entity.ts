import { ChatsEntity } from 'src/modules/chats/entities/chats.entity'
import { UsersEntity } from 'src/modules/users/entities/users.entity'
import { BaseWithDeletedAtEntity } from 'src/shared/entities/base-with-deleted-at.entity'
import { Column, Entity, ManyToOne } from 'typeorm'

@Entity('messages')
export class MessagesEntity extends BaseWithDeletedAtEntity {
  @Column({ type: 'text' })
  text: string

  @Column({ type: 'uuid' })
  chatId: string

  @ManyToOne(() => ChatsEntity, (chat) => chat.messages)
  chat: ChatsEntity

  @Column({ type: 'uuid' })
  userId: string

  @ManyToOne(() => UsersEntity, (user) => user.messages)
  user: UsersEntity
}
