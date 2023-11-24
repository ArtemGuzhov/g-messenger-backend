import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'

import { CommonBaseEntity } from '../../../shared/entities/common-base.entity'
import { SimpleFile } from '../../../shared/interfaces/simple-file.interface'
import { MessagesEntity } from '../../messages/entities/messages.entity'
import { UsersEntity } from '../../users/entities/users.entity'
import { ChatTypeEnum } from '../enums/chat-type.enum'

@Entity('chats')
export class ChatsEntity extends CommonBaseEntity {
  @Column({ type: 'text', nullable: true })
  name: string | null

  @Column({ type: 'enum', enum: ChatTypeEnum })
  type: ChatTypeEnum

  @Column({ type: 'simple-json', nullable: true })
  avatar: SimpleFile | null

  @Column({ type: 'boolean', default: false })
  isPersonal: boolean

  @OneToMany(() => MessagesEntity, (messages) => messages.chat, {
    nullable: true,
    cascade: true,
  })
  messages: MessagesEntity[] | null

  @ManyToMany(() => UsersEntity, (users) => users.chats, {
    nullable: true,
    cascade: ['insert'],
  })
  @JoinTable({ name: 'chats-members' })
  users: UsersEntity[]

  isNotReadMessagesCount?: number
}
