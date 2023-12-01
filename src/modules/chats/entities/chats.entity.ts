import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'

import { CommonBaseEntity } from '../../../shared/entities/common-base.entity'
import { SimpleFile } from '../../../shared/interfaces/simple-file.interface'
import { MessageCommentsEntity } from '../../messages/entities/message-comments.entity'
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

  @Column({ type: 'uuid', array: true, default: [] })
  expectedUserIds: string[]

  @Column({ type: 'uuid', array: true })
  participants: string[]

  @Column({ type: 'uuid' })
  creatorId: string

  @OneToMany(() => MessagesEntity, (messages) => messages.chat, {
    cascade: true,
  })
  messages: MessagesEntity[]

  @OneToMany(() => MessageCommentsEntity, (messageComments) => messageComments.chat, {
    cascade: true,
  })
  messageComemnts: MessageCommentsEntity[]

  @OneToMany(() => MessagesEntity, (messages) => messages.inviteChat)
  inviteMessages: MessagesEntity[]

  @ManyToMany(() => UsersEntity, (users) => users.chats, {
    nullable: true,
    cascade: ['insert'],
  })
  @JoinTable({
    name: 'chats-members',
    joinColumn: { name: 'chatId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  users: UsersEntity[]

  isNotReadMessagesCount?: number
  usersCount?: number
  lastMessage?: string | null
}
