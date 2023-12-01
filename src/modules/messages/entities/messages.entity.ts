import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'

import { CommonBaseEntity } from '../../../shared/entities/common-base.entity'
import { SimpleFile } from '../../../shared/interfaces/simple-file.interface'
import { SimpleUser } from '../../../shared/interfaces/simple-user.interface'
import { ChatsEntity } from '../../chats/entities/chats.entity'
import { UsersEntity } from '../../users/entities/users.entity'
import { MessageInviteStatusEnum } from '../enums/message-invite-status.enum'
import { MessageTypeEnum } from '../enums/message-type.enum'
import { MessageCommentsEntity } from './message-comments.entity'

@Entity('messages')
export class MessagesEntity extends CommonBaseEntity {
  @Column({ type: 'text', nullable: true })
  text: string | null

  @Column({ type: 'enum', enum: MessageTypeEnum })
  type: MessageTypeEnum

  @Column({ type: 'enum', enum: MessageInviteStatusEnum, nullable: true })
  inviteStatus: MessageInviteStatusEnum | null

  @Column({ type: 'boolean', default: false })
  isUpdated: boolean

  @Column({ type: 'text', array: true, default: [] })
  readersIds: string[]

  @Column({ type: 'simple-json', default: [] })
  files: SimpleFile[]

  @ManyToOne(() => ChatsEntity, (chat) => chat.inviteMessages, {
    nullable: true,
  })
  inviteChat: ChatsEntity | null

  @Column({ type: 'uuid', nullable: true })
  inviteChatId: string | null

  @ManyToOne(() => MessagesEntity, (repliedTo) => repliedTo.children, {
    nullable: true,
  })
  repliedTo: MessagesEntity | null

  @Column({ type: 'uuid', nullable: true })
  repliedToId: string | null

  @OneToMany(() => MessagesEntity, (message) => message.repliedTo)
  children: MessagesEntity[]

  @ManyToOne(() => UsersEntity, (user) => user.messages, {
    nullable: false,
    cascade: ['insert'],
  })
  user: UsersEntity

  @Column({ type: 'uuid' })
  userId: string

  @Column({ type: 'simple-json' })
  simpleUser: SimpleUser

  @ManyToOne(() => ChatsEntity, (chat) => chat.messages, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  chat: ChatsEntity

  @Column({ type: 'uuid' })
  chatId: string

  @OneToMany(() => MessageCommentsEntity, (comments) => comments.root)
  comments: MessageCommentsEntity[]

  isRead?: boolean
  commentsCount?: number
}
