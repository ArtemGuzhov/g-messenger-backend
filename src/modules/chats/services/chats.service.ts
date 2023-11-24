import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { MessageTypeEnum } from 'src/modules/messages/enums/message-type.enum'
import { Brackets, EntityManager, SelectQueryBuilder } from 'typeorm'

import { PaginationQueryDTO } from '../../../shared/dto/pagination-query.dto'
import { getPageAndLimit, RepositoryHelper } from '../../../shared/helpers'
import { ListResponse } from '../../../shared/interfaces/list-response.interface'
import { MessagesEntity } from '../../messages/entities/messages.entity'
import { MessageStatusEnum } from '../../messages/enums/message-status.enum'
import { MessagesService } from '../../messages/services/messages.service'
import { UsersService } from '../../users/services/users.service'
import { GetChatsDTO } from '../controllers/dto/get-chats.dto'
import { GetMessagesDTO } from '../controllers/dto/get-messages.dto'
import { ChatsEntity } from '../entities/chats.entity'
import { ChatTypeEnum } from '../enums/chat-type.enum'
import { CreateChatDTO } from '../gateways/dto/create-chat.dto'
import { CreateMessageDTO } from '../gateways/dto/create-message.dto'
import { MessageDTO } from '../gateways/dto/message.dto'
import { UpdateMessageDTO } from '../gateways/dto/update-message.dto'
import { CreateMessageRTO } from '../gateways/rto/create-message.rto'
import { ReadMessagesRTO } from '../gateways/rto/read-messages.rto'
import { UnreadedChatsCountRTO } from '../gateways/rto/unreaded-chats.rto'
import { UpdatedMessageRTO } from '../gateways/rto/updated-message.rto'

@Injectable()
export class ChatsService extends RepositoryHelper<ChatsEntity> {
  protected readonly alias = 'chats'

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
  ) {
    super(entityManager.getRepository(ChatsEntity))
  }

  /**
   * Получить чат по ID
   * @param id
   * @returns ChatsEntity
   */
  async getChatById(id: string): Promise<ChatsEntity> {
    const chat = await this.repository.findOne({
      where: { id },
      relations: {
        users: true,
      },
    })

    if (chat === null) {
      throw new NotFoundException('Chat not found')
    }

    return chat
  }

  /**
   * Получить ID чата между пользователями
   * @param userId
   * @param profileId
   * @returns Pick<ChatsEntity, 'id'>
   */
  async getChatIdBetweenUsers(
    userId: string,
    profileId: string,
  ): Promise<Pick<ChatsEntity, 'id'>> {
    const data: { chatsId: string; usersId: string }[] = await this.entityManager.query(
      `SELECT * FROM "chats-members" as "t" where "t"."usersId" = '${userId}' or "t"."usersId" = '${profileId}'`,
    )

    let chatIds = []
    for (const item of data) {
      if (item.usersId === profileId) {
        chatIds.push(item.chatsId)
      }

      if (item.usersId === userId) {
        chatIds.push(item.chatsId)
      }
    }
    chatIds = [...new Set(chatIds)]

    const id = chatIds[0]

    if (!id || chatIds.length > 1) {
      throw new NotFoundException('Chat id not found')
    }

    return { id }
  }

  /**
   * Получить чат с сообщениями
   * @param id
   * @returns ChatsEntity
   */
  async getChatWithMessagesById(id: string): Promise<ChatsEntity> {
    const chat = await this.repository.findOne({
      where: {
        id,
      },
      relations: {
        users: true,
        messages: true,
      },
    })

    if (chat === null) {
      throw new NotFoundException('Chat not found')
    }

    return chat
  }

  /**
   * Получить чат по ID с последним сообщением
   * @param id
   * @returns ChatsEntity
   */
  async getChatWithLastMessage(id: string, userId: string): Promise<ChatsEntity> {
    const queryBuilder = this.repository.createQueryBuilder(this.alias)
    const chat = await this.joinLinks(queryBuilder, { userId })
      .where(`${this.alias}.id = :id`, { id })
      .getOne()

    if (chat === null) {
      throw new NotFoundException('Chat not found')
    }

    if (chat.type === ChatTypeEnum.GROUP) {
      return chat
    }

    const chatWithName = this.getChatsWithNameAndAvatar(userId, [chat]).pop()

    if (!chatWithName) {
      throw new NotFoundException('Chat not found')
    }

    return chatWithName
  }

  /**
   * Получить активные чаты пользователя
   * @param userId
   * @returns ChatsRTO
   */
  async getUserChats(
    userId: string,
    payload: GetChatsDTO,
  ): Promise<ListResponse<ChatsEntity>> {
    const { currentChatsIds } = payload
    const { page, limit } = getPageAndLimit(payload.page, payload.limit)

    await this.usersService.getUserById(userId)
    const query = this.repository
      .createQueryBuilder(this.alias)
      .leftJoinAndSelect(`${this.alias}.users`, 'usr')
      .where(`usr.id = :userId`, { userId })

    if (currentChatsIds.length) {
      query.andWhere(`${this.alias}.id NOT IN (:...ids)`, {
        ids: currentChatsIds,
      })
    }

    const { items, meta } = await this.find(query, { page, limit }, { userId })

    return {
      items: this.getChatsWithNameAndAvatar(userId, items),
      meta,
    }
  }

  /**
   * Получить ID`s активных чатов и запросов пользователя
   * @param userId
   * @returns string[]
   */
  async getUserChatsIds(userId: string): Promise<string[]> {
    const chats = await this.repository.find({
      select: {
        id: true,
      },
      where: {
        users: {
          id: userId,
        },
      },
    })
    return chats.map(({ id }) => id)
  }

  /**
   * Получить запрос чаты пользователя
   * @param userId
   * @param payload
   * @returns ChatsRTO
   */
  async getUserRequestChats(
    userId: string,
    payload: GetChatsDTO,
  ): Promise<ListResponse<ChatsEntity>> {
    const { currentChatsIds } = payload
    const { page, limit } = getPageAndLimit(payload.page, payload.limit)
    await this.usersService.getUserById(userId)
    const query = this.repository
      .createQueryBuilder(this.alias)
      .leftJoinAndSelect(`${this.alias}.users`, 'usr')
      .where('usr.id = :userId', { userId })

    if (currentChatsIds.length) {
      query.andWhere(`${this.alias}.id NOT IN (:...ids)`, {
        ids: currentChatsIds,
      })
    }

    const { items, meta } = await this.find(query, { page, limit }, { userId })

    return { items: this.getChatsWithNameAndAvatar(userId, items), meta }
  }

  /**
   * Получить количество непрочитаннах чатов пользователя
   * @param userId
   * @returns UnreadedChatsCountRTO
   */
  async getUserUnreadedChatsCount(userId: string): Promise<UnreadedChatsCountRTO> {
    await this.usersService.getUserById(userId)
    const chatsCount = await this.repository
      .createQueryBuilder('chats')
      .leftJoin('chats.users', 'users')
      .innerJoin('chats.messages', 'messages')
      .where(
        new Brackets((qb) => {
          qb.where(':userId <> ALL (messages.readersIds)', {
            userId,
          }).orWhere('messages.readersIds IS NULL')
        }),
      )
      .andWhere('users.id = :userId', { userId })
      .andWhere('messages.userId <> :userId', { userId })
      .select('COUNT(DISTINCT(chats.id))', 'chatsCount')
      .getRawOne()
    return { chatsCount: +chatsCount.chatsCount }
  }

  /**
   * Поолучить чаты по его имени или имени пользователя пользователю
   * @param userId
   * @param text
   * @param status
   * @param payload
   * @returns ChatsRTO
   */
  async getChatsBySearch(
    userId: string,
    text: string,
    payload: PaginationQueryDTO,
  ): Promise<ListResponse<ChatsEntity>> {
    const { page, limit } = getPageAndLimit(payload.page, payload.limit)
    const query = this.repository
      .createQueryBuilder(this.alias)
      .leftJoinAndSelect(`${this.alias}.users`, 'usr')
      .where(`(${this.alias}.name ILike :text AND usr.id = :userId)`, {
        text: `%${text}%`,
        userId,
      })
      .orWhere(
        `(${this.alias}.type = :type AND (usr.id != :userId AND usr.name ILike :text OR usr.username ILike :text))`,
        {
          type: ChatTypeEnum.DIALOG,
          userId,
          text: `%${text}%`,
        },
      )
      .andWhere((subQuery) => {
        const subQueryBuilder = subQuery
          .subQuery()
          .select('cm.chatsId')
          .from('chats-members', 'cm')
          .where('cm.usersId = :userId', { userId })
          .getQuery()
        return `chats_usr.chatsId IN ${subQueryBuilder}`
      })
    const { items, meta } = await this.find(query, { page, limit }, { userId })

    return { items: this.getChatsWithNameAndAvatar(userId, items), meta }
  }

  async getChats(userId: string): Promise<ChatsEntity[]> {
    const messagesAlias = 'messages'
    const chatIds = await this.repository.find({
      where: {
        users: {
          id: userId,
        },
      },
      select: {
        id: true,
      },
    })

    if (chatIds.length === 0) {
      return []
    }

    const chats = await this.repository
      .createQueryBuilder(this.alias)
      .select([`${this.alias}.id`])
      .leftJoinAndSelect(`${this.alias}.users`, 'users')
      .leftJoinAndSelect(`${this.alias}.${messagesAlias}`, messagesAlias)
      .leftJoinAndSelect(`${messagesAlias}.user`, 'msg.user')
      .loadRelationCountAndMap(
        `${this.alias}.isNotReadMessagesCount`,
        `${this.alias}.${messagesAlias}`,
        messagesAlias,
        (qb) =>
          qb.where(
            `${messagesAlias}.userId != :userId
                            AND
                        :userId != ANY(${messagesAlias}.readersIds)
                            OR
                        ${messagesAlias}.userId != :userId
                            AND
                        ${messagesAlias}.readersIds IS NULL`,
            { userId },
          ),
      )
      .where(`${this.alias}.id IN (:...chatIds)`, {
        chatIds: chatIds.map(({ id }) => id),
      })
      .orderBy(`${messagesAlias}.createdAt`, 'DESC')
      .getMany()

    return this.getChatsWithNameAndAvatar(userId, chats)
  }

  /**
   * Поиск сообщений в чате по тексту
   * @param chatId
   * @param text
   * @param payload
   * @returns MessagesRTO
   */
  async getChatsMessagesBySearch(
    chatId: string,
    text: string,
    payload: PaginationQueryDTO,
  ): Promise<ListResponse<MessagesEntity>> {
    await this.getChatById(chatId)
    return await this.messagesService.getChatsMessagesBySearch(chatId, text, payload)
  }

  /**
   * Получить сообщения чата
   * @param chatId
   * @returns MessagesRTO
   */
  async getChatMessages(
    chatId: string,
    userId: string,
    payload: GetMessagesDTO,
  ): Promise<ListResponse<MessagesEntity>> {
    const chat = await this.getChatById(chatId)

    if (chat.users !== null && !chat.users.find(({ id }) => id === userId)) {
      throw new ForbiddenException('Permission denied')
    }

    return await this.messagesService.getChatMessages(chatId, payload)
  }

  async updateOnline(userId: string, isOnline: boolean): Promise<void> {
    await this.usersService.updateOnline(userId, isOnline)
  }

  // async attachOrUnAttached()

  async createChat(userId: string, payload: CreateChatDTO): Promise<ChatsEntity> {
    const users = await this.usersService.getListByIds([userId, ...payload.userIds])

    if (payload.userIds.length === 1) {
      const isExistChat = await this.repository
        .createQueryBuilder(this.alias)
        .leftJoin(`${this.alias}.users`, 'users')
        .where(`users.id = :userId`, {
          userId,
        })
        .andWhere('users.id = :profileId', {
          profileId: payload.userIds[0],
        })
        .getOne()

      if (isExistChat) {
        throw new BadRequestException('Dialog already exist')
      }

      const newChat = this.repository.create({
        type: ChatTypeEnum.DIALOG,
        users,
      })
      const chat = this.getChatsWithNameAndAvatar(userId, [
        await this.repository.save(newChat),
      ])[0]

      if (!chat) {
        throw new NotFoundException()
      }

      return chat
    }

    const newChat = this.repository.create({
      type: ChatTypeEnum.GROUP,
      name: payload.name,
      users,
    })

    return this.repository.save(newChat)
  }

  /**
   * Создать диалог с пользователем
   * @param userId
   * @param profileId
   * @returns ChatsEntity
   */
  async createDialog(
    userId: string,
    profileId: string,
    messageText: string,
  ): Promise<ChatsEntity> {
    const user = await this.usersService.getUserById(userId)
    const profile = await this.usersService.getUserById(profileId)

    const isExistDialog = await this.isExistDialog(userId, profileId)

    if (isExistDialog) {
      throw new BadRequestException('Dialog already exist')
    }

    const newChat = this.repository.create({
      users: [user, profile],
      type: ChatTypeEnum.DIALOG,
      messages: [
        {
          text: messageText,
          user,
          status: MessageStatusEnum.SENT,
          type: MessageTypeEnum.DEFAULT,
        },
      ],
    })
    await this.repository.save(newChat)

    return this.repository.save(newChat)
  }

  /**
   * Создать групповой чат
   * @param userId
   * @param profilesIds
   * @param name
   * @returns ChatsEntity
   */
  async createGroupChat(
    userId: string,
    profilesIds: string[],
    name: string,
  ): Promise<ChatsEntity> {
    const users = []

    for (const id of [...profilesIds, userId]) {
      const user = await this.usersService.getUserById(id)
      users.push(user)
    }

    const newChat = this.repository.create({
      users,
      type: ChatTypeEnum.GROUP,
      name,
    })

    return this.repository.save(newChat)
  }

  /**
   * Добавить сообщение в чат
   * @param userId
   * @param payload
   * @returns MessagesEntity
   */
  async createMessage(
    userId: string,
    payload: CreateMessageDTO,
  ): Promise<CreateMessageRTO> {
    const { chatId } = payload

    if (!payload.filesIds && !payload.text) {
      throw new BadRequestException('Message is empty')
    }

    const chat = await this.getChatById(chatId)

    const user = await this.usersService.getUserById(userId)
    const newMessage = await this.messagesService.createMessage(chat, user, payload)

    return {
      newMessage,
      chatId,
      userId,
    }
  }

  /**
   * Редактировать сообщение в чате
   * @param userId
   * @param payload
   * @returns MessagesEntity
   */
  async editMessage(
    userId: string,
    payload: UpdateMessageDTO,
  ): Promise<UpdatedMessageRTO> {
    const { chatId } = payload

    const chat = await this.getChatById(chatId)

    if (!chat.users?.find((user) => user.id === userId)) {
      throw new BadRequestException('Permission denied')
    }

    const updatedMessage = await this.messagesService.updateMessage(payload)

    return { updatedMessage, chatId, userId }
  }

  /**
   * Удалить сообщение в чате
   * @param userId
   * @param payload
   * @returns MessagesEntity
   */
  async deleteMessage(userId: string, payload: MessageDTO): Promise<void> {
    const { chatId } = payload

    const chat = await this.getChatById(chatId)

    if (!chat.users?.find((user) => user.id === userId)) {
      throw new BadRequestException('Permission denied')
    }

    await this.messagesService.deleteMessage(payload.messageId)
  }

  /**
   * Обновить статус прочтения у сообщений
   * @param messagesIds
   * @returns ReadMessagesRTO
   */
  async readChatMessages(
    chatId: string,
    userId: string,
    messagesIds: string[],
  ): Promise<ReadMessagesRTO> {
    await this.getChatById(chatId)
    await this.usersService.getUserById(userId)

    const readMessages = await this.messagesService.readMessages(
      chatId,
      userId,
      messagesIds,
    )

    return {
      chatId,
      readMessages,
    }
  }

  /**
   * Обновить название чата
   * @param id
   * @returns
   */
  async update(id: string): Promise<ChatsEntity> {
    await this.getChatById(id)
    return await this.repository.save({ id })
  }

  /**
   * Удалить чат
   * @param id
   * @param userId
   */
  async deleteDialog(id: string, userId: string): Promise<void> {
    const chat = await this.getChatById(id)
    if (!chat.users?.find((user) => user.id === userId)) {
      throw new BadRequestException('Permission denied')
    }

    await this.repository.remove(chat)
  }

  /**
   * Очистить чат
   * @param id
   * @param userId
   */
  async clearChat(id: string, userId: string): Promise<ChatsEntity> {
    const chat = await this.getChatWithMessagesById(id)
    if (!chat.users?.find((user) => user.id === userId)) {
      throw new BadRequestException('Permission denied')
    }
    if (chat.messages?.length) {
      await this.entityManager.remove(MessagesEntity, chat.messages)
      chat.messages = []
    }
    return chat
  }

  /**
   * Изменить статус сообщения
   * @param id
   * @param messagesIds
   * @param userId
   * @param status
   * @returns MessageRTO[]
   */
  async changeMessageStatus(
    id: string,
    messagesIds: string[],
    userId: string,
    status: MessageStatusEnum,
  ): Promise<MessagesEntity[]> {
    await this.getChatById(id)
    await this.usersService.getUserById(userId)

    const updatedMessages = await this.messagesService.changeMessageStatus(
      messagesIds,
      status,
    )
    return updatedMessages
  }

  /**
   * Получить id пользователей в чате
   * @param chatId
   * @returns string[]
   */
  async getUsersIdInChat(chatId: string): Promise<string[]> {
    const users = (await this.getChatById(chatId)).users || []
    return users?.map((e) => e.id)
  }

  protected joinLinks(
    queryBuilder: SelectQueryBuilder<ChatsEntity>,
    values: { userId: string },
  ): SelectQueryBuilder<ChatsEntity> {
    const messagesAlias = 'messages'

    return (
      queryBuilder
        .leftJoinAndSelect(
          `${this.alias}.${messagesAlias}`,
          messagesAlias,
          `${this.alias}.id = ${messagesAlias}.chatId`,
        )
        .leftJoinAndSelect(`${messagesAlias}.user`, 'msg.user')
        .leftJoinAndSelect(`${this.alias}.users`, 'users')
        // .leftJoin(
        //   (subQuery) => {
        //     return subQuery
        //       .select(`${messagesAlias}.chatId`)
        //       .addSelect(`MAX(${messagesAlias}.createdAt)`, 'createdAt')
        //       .from(MessagesEntity, messagesAlias)
        //       .groupBy(`${messagesAlias}.chatId`)
        //   },
        //   'lastMessage',
        //   `${messagesAlias}.chatId = "lastMessage"."chatId" AND ${messagesAlias}.createdAt = "lastMessage"."createdAt"`,
        // )
        // .loadRelationCountAndMap(
        //   `${this.alias}.isNotReadMessagesCount`,
        //   `${this.alias}.${messagesAlias}`,
        //   messagesAlias,
        //   (qb) =>
        //     qb.where(
        //       `${messagesAlias}.userId != :userId
        //                     AND
        //                 :userId != ANY(${messagesAlias}.readersIds)
        //                     OR
        //                 ${messagesAlias}.userId != :userId
        //                     AND
        //                 ${messagesAlias}.readersIds IS NULL`,
        //       { userId: values.userId },
        //     ),
        // )
        .orderBy(`${messagesAlias}.createdAt`, 'DESC')
    )
  }

  /**
   * Проверка на существование диалога
   * @param userId
   * @param profileId
   * @returns boolean
   */
  private async isExistDialog(userId: string, profileId: string): Promise<boolean> {
    const chats = await this.repository
      .createQueryBuilder(this.alias)
      .leftJoinAndSelect(`${this.alias}.users`, 'users')
      .where(
        `(users.id = :userId OR users.id = :profileId) AND ${this.alias}.type = :type`,
        {
          userId,
          profileId,
          type: ChatTypeEnum.DIALOG,
        },
      )
      .withDeleted()
      .getMany()

    for (const { users } of chats) {
      let isExistUser = false
      let isExistProfile = false

      if (users !== null) {
        for (const { id } of users) {
          if (id === userId) {
            isExistUser = true
          }
          if (id === profileId) {
            isExistProfile = true
          }
        }
      }

      if (isExistProfile === isExistUser) {
        return true
      }
    }
    return false
  }

  private getChatsWithNameAndAvatar(userId: string, chats: ChatsEntity[]): ChatsEntity[] {
    return chats.map((chat) => {
      if (chat.type === ChatTypeEnum.GROUP) {
        return chat
      }

      const user = chat.users?.filter(({ id }) => id !== userId).pop()

      if (!user) {
        return chat
      }

      return { ...chat, name: user.name, avatar: user.avatar } as ChatsEntity
    })
  }
}
