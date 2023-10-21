import { ChatsEntity } from 'src/modules/chats/entities/chats.entity'
import { MessagesEntity } from 'src/modules/messages/entities/messages.entity'
import { BaseWithDeletedAtEntity } from 'src/shared/entities/base-with-deleted-at.entity'
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm'

@Entity('users')
export class UsersEntity extends BaseWithDeletedAtEntity {
  @Column({ type: 'varchar', unique: true })
  email: string

  @Column({ type: 'text' })
  password: string

  @ManyToMany(() => ChatsEntity, (chats) => chats.users)
  chats: ChatsEntity[]

  @OneToMany(() => MessagesEntity, (messages) => messages.user)
  messages: MessagesEntity[]
}
