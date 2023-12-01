import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'

import { CommonBaseEntity } from '../../../shared/entities/common-base.entity'
import { SimpleFile } from '../../../shared/interfaces/simple-file.interface'
import { SimpleUser } from '../../../shared/interfaces/simple-user.interface'
import { ChatsEntity } from '../../chats/entities/chats.entity'
import { UsersEntity } from '../../users/entities/users.entity'
import { MessageTypeEnum } from '../enums/message-type.enum'
import { MessagesEntity } from './messages.entity'

@Entity('message-comments')
export class MessageCommentsEntity extends CommonBaseEntity {
  @Column({ type: 'text', nullable: true })
  text: string | null

  @Column({ type: 'enum', enum: MessageTypeEnum })
  type: MessageTypeEnum

  @Column({ type: 'boolean', default: false })
  isUpdated: boolean

  @Column({ type: 'text', array: true, default: [] })
  readersIds: string[]

  @ManyToOne(() => UsersEntity, (user) => user.messageComments, {
    nullable: false,
    cascade: ['insert'],
  })
  user: UsersEntity

  @Column({ type: 'uuid' })
  userId: string

  @Column({ type: 'simple-json', default: [] })
  files: SimpleFile[]

  @Column({ type: 'simple-json' })
  simpleUser: SimpleUser

  @ManyToOne(() => MessagesEntity, (root) => root.comments)
  root: MessagesEntity

  @Column({ type: 'uuid' })
  rootId: string

  @ManyToOne(() => MessageCommentsEntity, (repliedTo) => repliedTo.children, {
    nullable: true,
  })
  repliedTo: MessageCommentsEntity | null

  @Column({ type: 'uuid', nullable: true })
  repliedToId: string | null

  @OneToMany(() => MessageCommentsEntity, (message) => message.repliedTo)
  children: MessageCommentsEntity[]

  @ManyToOne(() => ChatsEntity, (chat) => chat.messageComemnts, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  chat: ChatsEntity

  @Column({ type: 'uuid' })
  chatId: string

  isRead?: boolean
}
