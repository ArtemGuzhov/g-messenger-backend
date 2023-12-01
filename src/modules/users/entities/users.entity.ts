import { ChatsEntity } from 'src/modules/chats/entities/chats.entity'
import { CompaniesEntity } from 'src/modules/companies/entities/companies.entity'
import { MessageCommentsEntity } from 'src/modules/messages/entities/message-comments.entity'
import { MessagesEntity } from 'src/modules/messages/entities/messages.entity'
import { CommonBaseEntity } from 'src/shared/entities/common-base.entity'
import { SimpleFile } from 'src/shared/interfaces/simple-file.interface'
import { AfterInsert, Column, Entity, ManyToMany, ManyToOne } from 'typeorm'

@Entity('users')
export class UsersEntity extends CommonBaseEntity {
  @Column({ type: 'varchar', unique: true })
  email: string

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'text' })
  password: string

  @Column({ type: 'simple-json', nullable: true })
  avatar: SimpleFile | null

  @Column({ type: 'boolean', default: false })
  isOnline: boolean

  @Column({ type: 'timestamptz', nullable: true })
  onlineAt: string | null

  @Column({ type: 'varchar', default: 'dev' })
  label: string

  @Column({ type: 'uuid', array: true, default: [] })
  favoriteChatIds: string[]

  @ManyToOne(() => CompaniesEntity, (company) => company.users, {
    nullable: false,
  })
  company: CompaniesEntity

  @Column({ type: 'uuid' })
  companyId: string

  @ManyToOne(() => MessagesEntity, (messages) => messages.user, {
    nullable: true,
  })
  messages: MessagesEntity[] | null

  @ManyToOne(() => MessageCommentsEntity, (comments) => comments.user)
  messageComments: MessageCommentsEntity[]

  @ManyToMany(() => ChatsEntity, (chats) => chats.users, {
    nullable: true,
  })
  chats: ChatsEntity[]

  isExpect?: boolean

  @AfterInsert()
  setOnlineAt(): void {
    this.onlineAt = new Date().toISOString()
  }
}
