import { ChatsEntity } from 'src/modules/chats/entities/chats.entity'
import { MessagesEntity } from 'src/modules/messages/entities/messages.entity'
import { BaseWithDeletedAtEntity } from 'src/shared/entities/base-with-deleted-at.entity'
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm'
import { UserStatus } from '../enums/user-status.enum'

@Entity('users')
export class UsersEntity extends BaseWithDeletedAtEntity {
  @Column({ type: 'varchar', unique: true })
  email: string

  @Column({ type: 'text' })
  password: string

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.INACTIVE })
  status: UserStatus

  @ManyToMany(() => ChatsEntity, (chats) => chats.users)
  chats: ChatsEntity[]

  @OneToMany(() => MessagesEntity, (messages) => messages.user)
  messages: MessagesEntity[]
}
