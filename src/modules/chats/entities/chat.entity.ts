import { MessageEntity } from 'src/modules/messages/entities/message.entity'
import { UserEntity } from 'src/modules/users/entities/user.entity'
import { BaseWithDeletedAtEntity } from 'src/shared/entities/base-with-deleted-at.entity'
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'
import { ChatFormat } from '../enums/chat-format.enum'

@Entity('chats')
export class ChatEntity extends BaseWithDeletedAtEntity {
  @Column({ type: 'varchar', nullable: true })
  name: string | null

  @Column({ type: 'enum', enum: ChatFormat })
  format: ChatFormat

  @OneToMany(() => MessageEntity, (messages) => messages.chat)
  messages: MessageEntity[]

  @ManyToMany(() => UserEntity, (users) => users.chats)
  @JoinTable({
    name: 'chats-users',
    joinColumn: { name: 'chatId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  users: UserEntity[]
}
