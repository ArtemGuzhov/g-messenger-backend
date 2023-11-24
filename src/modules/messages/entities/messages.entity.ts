import { SimpleFile } from 'src/shared/interfaces/simple-file.interface'
import { Column, Entity, ManyToOne } from 'typeorm'

import { CommonBaseEntity } from '../../../shared/entities/common-base.entity'
import { ChatsEntity } from '../../chats/entities/chats.entity'
import { UsersEntity } from '../../users/entities/users.entity'
import { MessageStatusEnum } from '../enums/message-status.enum'
import { MessageTypeEnum } from '../enums/message-type.enum'

@Entity('messages')
export class MessagesEntity extends CommonBaseEntity {
  @Column({ type: 'text', nullable: true })
  text: string | null

  @Column({ type: 'text', array: true, nullable: true })
  readersIds: string[] | null

  @Column({ type: 'enum', enum: MessageTypeEnum })
  type: MessageTypeEnum

  @Column({ type: 'enum', enum: MessageStatusEnum })
  status: MessageStatusEnum

  @ManyToOne(() => UsersEntity, (user) => user.messages, {
    nullable: false,
    cascade: ['insert'],
  })
  user: UsersEntity

  @Column({ type: 'uuid' })
  userId: string

  @ManyToOne(() => ChatsEntity, (chat) => chat.messages, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  chat: ChatsEntity

  @Column({ type: 'uuid' })
  chatId: string

  @Column({ type: 'simple-json', array: true, default: [] })
  files: SimpleFile[] | null

  isRead?: boolean
}
