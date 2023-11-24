import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { UpdateMessageDTO } from 'src/modules/chats/gateways/dto/update-message.dto'
import { ListResponse } from 'src/shared/interfaces/list-response.interface'
import { EntityManager, In, Not, SelectQueryBuilder } from 'typeorm'

import { PaginationQueryDTO } from '../../../shared/dto/pagination-query.dto'
import { getPageAndLimit, RepositoryHelper } from '../../../shared/helpers'
import { GetMessagesDTO } from '../../chats/controllers/dto/get-messages.dto'
import { ChatsEntity } from '../../chats/entities/chats.entity'
import { CreateMessageDTO } from '../../chats/gateways/dto/create-message.dto'
import { UsersEntity } from '../../users/entities/users.entity'
import { MessagesEntity } from '../entities/messages.entity'
import { MessageStatusEnum } from '../enums/message-status.enum'
import { MessageTypeEnum } from '../enums/message-type.enum'

@Injectable()
export class MessagesService extends RepositoryHelper<MessagesEntity> {
  protected readonly alias = 'messages'

  constructor(
    @InjectEntityManager()
    protected readonly entityManager: EntityManager,
  ) {
    super(entityManager.getRepository(MessagesEntity))
  }

  /**
   * Получить сообщения чата
   * @param chatId
   * @returns MessagesEntity[]
   */
  async getChatMessages(
    chatId: string,
    payload: GetMessagesDTO,
  ): Promise<ListResponse<MessagesEntity>> {
    const { currentMessagesIds } = payload
    const { page, limit } = getPageAndLimit(payload.page, payload.limit)

    const query = this.repository
      .createQueryBuilder(this.alias)
      .where(`${this.alias}.chat = :chatId`, {
        chatId,
      })
      .orderBy(`${this.alias}.createdAt`, 'DESC')

    if (currentMessagesIds.length) {
      query.andWhere(`${this.alias}.id NOT IN (:...currentMessagesIds)`, {
        currentMessagesIds,
      })
    }

    return this.find(
      query,
      { page, limit },
      {},
      {
        moreDistinctSelect: [
          {
            sql: `${this.alias}.createdAt`,
            name: 'createdAt',
          },
        ],
      },
    )
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
    const { page, limit } = getPageAndLimit(payload.page, payload.limit)
    return this.find(
      this.repository
        .createQueryBuilder(this.alias)
        .where(`${this.alias}.text ILIKE :text`, {
          text: `%${text}%`,
        })
        .andWhere(`${this.alias}.chat = :chatId`, {
          chatId,
        }),
      { page, limit },
    )
  }

  /**
   * Создать сообщение
   * @param chat
   * @param user
   * @param text
   * @returns MessagesEntity
   */
  async createMessage(
    chat: ChatsEntity,
    user: UsersEntity,
    payload: CreateMessageDTO,
  ): Promise<MessagesEntity> {
    // const files = []
    // TODO: add isolation lvl
    const message = await this.entityManager.transaction(
      async (transactionEntityManager) => {
        const newMessage = transactionEntityManager.create(MessagesEntity, {
          user,
          chat,
          text: payload.text,
          type: MessageTypeEnum.DEFAULT,
          status: MessageStatusEnum.SENT,
        })
        await transactionEntityManager.save(newMessage)

        // for (const file of files) {
        //   await transactionEntityManager.save(FilesEntity, {
        //     id: file.id,
        //     isLinked: true,
        //     message: newMessage,
        //   })
        // }
        newMessage.files = []
        return newMessage
      },
    )

    return message
  }

  /**
   * Редактировать сообщение
   * @param payload
   * @returns MessagesEntity
   */
  async updateMessage(payload: UpdateMessageDTO): Promise<MessagesEntity> {
    // TODO: add isolation lvl
    return this.entityManager.transaction(async (transactionEntityManager) => {
      const message = await transactionEntityManager.findOneOrFail(MessagesEntity, {
        where: { id: payload.id },
        relations: {
          files: true,
        },
      })

      message.files = []
      await transactionEntityManager.save(message)

      return message
    })
  }

  /**
   * Удалить сообщение
   * @param chat
   * @param user
   * @param text
   * @returns MessagesEntity
   */
  async deleteMessage(id: string): Promise<MessagesEntity> {
    const message = await this.repository.findOneOrFail({ where: { id } })
    await this.repository.remove(message)
    return message
  }

  /**
   * Обновить статус прочтения у сообщений
   * @param ids
   * @returns MessagesEntity[]
   */
  async readMessages(
    chatId: string,
    userId: string,
    ids: string[],
  ): Promise<MessagesEntity[]> {
    const messages = await this.repository.find({
      where: {
        id: In(ids),
        user: { id: Not(userId) },
        chat: { id: chatId },
      },
      relations: {
        user: true,
        files: true,
      },
    })
    const updatedMessages = messages.map((message) => {
      if (message.readersIds !== null) {
        if (message.readersIds.includes(userId)) {
          return message
        }

        message.readersIds = [...message.readersIds, userId]
        return message
      }

      return {
        ...message,
        readersIds: [userId],
      }
    })

    return this.repository.save(updatedMessages)
  }

  /**
   * Обновить статус сообщений
   * @param ids
   * @param status
   * @returns MessagesEntity[]
   */
  async changeMessageStatus(
    ids: string[],
    status: MessageStatusEnum,
  ): Promise<MessagesEntity[]> {
    const messages = await this.repository.find({
      where: { id: In(ids) },
      relations: {
        chat: true,
        files: true,
        user: true,
      },
    })
    const updatedMessages = messages.map((message) => ({
      ...message,
      status,
    }))

    return this.repository.save(updatedMessages)
  }

  protected joinLinks(
    queryBuilder: SelectQueryBuilder<MessagesEntity>,
  ): SelectQueryBuilder<MessagesEntity> {
    return queryBuilder
      .leftJoinAndSelect(`${this.alias}.user`, 'users')
      .leftJoinAndSelect(`${this.alias}.files`, 'files')
      .leftJoinAndSelect(`files.crop`, 'crop')
      .leftJoinAndSelect(`files.review`, 'review')
  }
}
