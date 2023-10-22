import { ChatEntity } from 'src/modules/chats/entities/chat.entity'
import { MessageEntity } from 'src/modules/messages/entities/message.entity'
import { BaseWithDeletedAtEntity } from 'src/shared/entities/base-with-deleted-at.entity'
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm'
import { UserStatus } from '../enums/user-status.enum'

@Entity('users')
export class UserEntity extends BaseWithDeletedAtEntity {
  @Column({ type: 'varchar', unique: true })
  email: string

  @Column({ type: 'text' })
  password: string

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.INACTIVE })
  status: UserStatus

  @ManyToMany(() => ChatEntity, (chats) => chats.users)
  chats: ChatEntity[]

  @OneToMany(() => MessageEntity, (messages) => messages.user)
  messages: MessageEntity[]
}
