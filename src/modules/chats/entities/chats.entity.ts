import { MessagesEntity } from 'src/modules/messages/entities/messages.entity'
import { UsersEntity } from 'src/modules/users/entities/users.entity'
import { BaseWithDeletedAtEntity } from 'src/shared/entities/base-with-deleted-at.entity'
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'
import { ChatType } from '../enums/chat-type.enum'

@Entity('chats')
export class ChatsEntity extends BaseWithDeletedAtEntity {
  @Column({ type: 'varchar', nullable: true })
  name: string | null

  @Column({ type: 'enum', enum: ChatType })
  type: ChatType

  @OneToMany(() => MessagesEntity, (messages) => messages.chat)
  messages: MessagesEntity[]

  @ManyToMany(() => UsersEntity, (users) => users.chats)
  @JoinTable({
    name: 'chats-users',
    joinColumn: { name: 'chatId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  users: UsersEntity[]
}
