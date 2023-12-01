import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'

import { UsersEntity } from '../../users/entities/users.entity'
import { UsersService } from '../../users/services/users.service'
import { CreateChatDTO } from '../dto/create-chat.dto'
import { ChatsEntity } from '../entities/chats.entity'
import { ChatTypeEnum } from '../enums/chat-type.enum'

@Injectable()
export class ChatsService {
  protected readonly alias = 'chats'
  private readonly repository: Repository<ChatsEntity>

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly usersService: UsersService,
  ) {
    this.repository = this.entityManager.getRepository(ChatsEntity)
  }

  async getUserChatIds(userId: string): Promise<string[]> {
    const chats = await this.repository
      .createQueryBuilder(this.alias)
      .select(`${this.alias}.id`)
      .where(`:userId = ANY(${this.alias}.participants)`, {
        userId,
      })
      .getMany()

    return chats.map(({ id }) => id)
  }

  async getChatUsers(id: string): Promise<UsersEntity[]> {
    const chat = await this.repository
      .createQueryBuilder(this.alias)
      .select([
        `${this.alias}.id`,
        `${this.alias}.expectedUserIds`,
        `users.id`,
        'users.name',
        'users.label',
        'users.avatar',
      ])
      .leftJoin(
        `${this.alias}.users`,
        'users',
        `users.id = ANY(${this.alias}.participants)`,
      )
      .where(`${this.alias}.id = :id`, {
        id,
      })
      .getOne()

    if (chat === null) {
      throw new NotFoundException('Chat not found')
    }

    const expectedUsers = await this.usersService.getSimpleUsers(chat.expectedUserIds)

    return [
      ...chat.users,
      ...(expectedUsers.map((user) => ({ ...user, isExpect: true })) as UsersEntity[]),
    ]
  }

  async checkUserExistInParticipants(id: string, userId: string): Promise<boolean> {
    return !!(await this.repository
      .createQueryBuilder(`${this.alias}`)
      .select(`${this.alias}.id`)
      .where(`(${this.alias}.id = :id and :userId = ANY(${this.alias}.participants))`, {
        id,
        userId,
      })
      .getOne())
  }

  async checkUserExistInExpected(id: string, userId: string): Promise<boolean> {
    return !!(await this.repository
      .createQueryBuilder(`${this.alias}`)
      .select(`${this.alias}.id`)
      .where(
        `(${this.alias}.id = :id and :userId = ANY(${this.alias}.expectedUserIds))`,
        {
          id,
          userId,
        },
      )
      .getOne())
  }

  async checkUserExistInGroup(id: string, userId: string): Promise<boolean> {
    return !!(await this.repository
      .createQueryBuilder(`${this.alias}`)
      .select(`${this.alias}.id`)
      .where(
        `(${this.alias}.id = :id and :userId = ANY(${this.alias}.expectedUserIds))`,
        {
          id,
          userId,
        },
      )
      .orWhere(`(${this.alias}.id = :id and :userId = ANY(${this.alias}.participants))`, {
        id,
        userId,
      })
      .getOne())
  }

  async addOrDelUserFromExpectedChat(id: string, userId: string): Promise<void> {
    const chat = await this.repository.findOne({
      where: {
        id,
      },
      select: {
        id: true,
        expectedUserIds: true,
      },
    })

    if (chat === null) {
      throw new NotFoundException('Chat not found')
    }

    const isExist = !!chat.expectedUserIds.find((id) => id === userId)

    if (isExist) {
      await this.repository.save({
        id,
        expectedUserIds: chat.expectedUserIds.filter((id) => id !== userId),
      })
      return
    }

    await this.repository.save({
      id,
      expectedUserIds: [...chat.expectedUserIds, userId],
    })
  }

  async getChatIsNotReadMessagesCount(id: string, userId: string): Promise<number> {
    const chat = await this.repository
      .createQueryBuilder(this.alias)
      .select([`${this.alias}.id`])
      .where(`${this.alias}.id = :id`, {
        id,
      })
      .loadRelationCountAndMap(
        `${this.alias}.isNotReadMessagesCount`,
        `${this.alias}.messages`,
        'messages',
        (qb) =>
          qb.where(
            `messages.userId != :userId
                            AND
                        :userId != ANY(messages.readersIds)
                            OR
                        messages.userId != :userId
                            AND
                        cardinality(messages.readersIds) = 0`,
            { userId },
          ),
      )
      .getOne()

    if (chat === null || !chat.isNotReadMessagesCount) {
      return 0
    }

    return chat.isNotReadMessagesCount
  }

  async getUserChats(userId: string, chatIds?: string[]): Promise<ChatsEntity[]> {
    chatIds = chatIds ?? (await this.getUserChatIds(userId))

    if (!chatIds.length) return []

    const { entities, raw } = await this.repository
      .createQueryBuilder(this.alias)
      .select([`${this.alias}`, 'users.id', 'users.name', 'users.avatar', 'users.label'])
      .addSelect(
        `(select "messages"."text" from "messages" where "messages"."chatId" = "${this.alias}"."id" and "messages"."deletedAt" is null order by "messages"."createdAt" desc limit 1)`,
        'lastMessage',
      )
      .addSelect(
        `(select "messages"."createdAt" from "messages" where "messages"."chatId" = "${this.alias}"."id" and "messages"."deletedAt" is null order by "messages"."createdAt" desc limit 1)`,
        'lastMessageCreatedAt',
      )
      .leftJoin(`${this.alias}.users`, 'users')
      .where(`${this.alias}.id IN (:...chatIds)`, {
        chatIds,
      })
      .loadRelationCountAndMap(
        `${this.alias}.isNotReadMessagesCount`,
        `${this.alias}.messages`,
        'messages',
        (qb) =>
          qb.where(
            `messages.userId != :userId
                            AND
                        :userId != ANY(messages.readersIds)
                            OR
                        messages.userId != :userId
                            AND
                        cardinality(messages.readersIds) = 0`,
            { userId },
          ),
      )
      .loadRelationCountAndMap(`${this.alias}.usersCount`, `${this.alias}.users`, 'users')
      .orderBy('"lastMessageCreatedAt"', 'DESC')
      .getRawAndEntities()

    const res = []

    for (const entity of entities) {
      const lastMessage = (
        raw as { chats_id: string; lastMessage: string | null }[]
      ).find((r) => r.chats_id === entity.id)?.lastMessage

      res.push({ ...entity, lastMessage: lastMessage })
    }

    return res
  }

  async create(userId: string, payload: CreateChatDTO): Promise<ChatsEntity> {
    const isGroup = payload.userIds.length > 1

    const newChat = this.repository.create({
      name: isGroup ? payload.name ?? 'Новая группа' : null,
      users: [...payload.userIds, userId].map((id) => ({ id })),
      type: isGroup ? ChatTypeEnum.GROUP : ChatTypeEnum.DIALOG,
      participants: [...payload.userIds, userId],
      creatorId: userId,
    })
    const id = (await this.repository.save(newChat)).id

    const chat = await this.repository
      .createQueryBuilder(this.alias)
      .select([`${this.alias}`, 'users.id', 'users.name', 'users.avatar', 'users.label'])
      .leftJoin(`${this.alias}.users`, 'users')
      .where(`${this.alias}.id = :id`, {
        id,
      })
      .loadRelationCountAndMap(
        `${this.alias}.isNotReadMessagesCount`,
        `${this.alias}.messages`,
        'messages',
        (qb) =>
          qb.where(
            `messages.userId != :userId
                            AND
                        :userId != ANY(messages.readersIds)
                            OR
                        messages.userId != :userId
                            AND
                        cardinality(messages.readersIds) = 0`,
            { userId },
          ),
      )
      .loadRelationCountAndMap(`${this.alias}.usersCount`, `${this.alias}.users`, 'users')
      .getOne()

    if (chat === null) {
      throw new InternalServerErrorException('Create chat error')
    }

    return chat
  }

  async checkExistDialog(userId: string, profileId: string): Promise<string | null> {
    const raws = await this.repository
      .createQueryBuilder(this.alias)
      .distinct(true)
      .select([`${this.alias}.id`, 'users.id'])
      .leftJoin(`${this.alias}.users`, 'users')
      .where(`users.id IN (:...userIds)`, {
        userIds: [userId, profileId],
      })
      .andWhere(`${this.alias}.type = :type`, {
        type: ChatTypeEnum.DIALOG,
      })
      .getRawMany()

    if (raws.length === 1 || !raws.length) {
      return null
    }

    const res: Record<
      string,
      {
        isProfile?: boolean
        isUser?: boolean
      }
    > = {}

    for (const { chats_id: chatId, users_id: id } of raws) {
      const isProfile = profileId === id
      const isUser = userId === id

      if (isProfile) {
        res[chatId] = {
          ...res[chatId],
          isProfile,
        }
      }

      if (isUser) {
        res[chatId] = {
          ...res[chatId],
          isUser,
        }
      }
    }

    for (const [chatId, { isProfile, isUser }] of Object.entries(res)) {
      if (isUser && isProfile) {
        return chatId
      }
    }

    return null
  }

  async leaveOrJoinGroup(id: string, userId: string): Promise<void> {
    const chat = await this.repository.findOne({
      where: {
        id,
      },
      select: {
        id: true,
        participants: true,
      },
    })

    if (chat === null) {
      throw new NotFoundException('Chat not found')
    }

    console.log(chat)

    const isExist = !!chat.participants.find((id) => id === userId)

    console.log('isExistChat', isExist)

    if (isExist) {
      await this.repository.save({
        id,
        participants: chat.participants.filter((id) => id !== userId),
      })
      await this.entityManager.query(
        `delete from "chats-members" where "chatId" = '${id}' and "userId" = '${userId}'`,
      )
      return
    }

    await this.repository.save({
      id,
      participants: [...chat.participants, userId],
    })
    await this.entityManager.query(
      `insert into "chats-members" ("chatId", "userId") values ('${id}', '${userId}')`,
    )
  }
}
