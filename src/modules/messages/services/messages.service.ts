import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { EntityManager, In, Repository } from 'typeorm'

import { SimpleUser } from '../../../shared/interfaces/simple-user.interface'
import { FilesService } from '../../files/services/files.service'
import { CreateMessageDTO } from '../dto/create-message.dto'
import { DeleteMessageDTO } from '../dto/delete-message.dto'
import { InviteUserDTO } from '../dto/invite-user.dto'
import { UpdateMessageDTO } from '../dto/update-message.dto'
import { MessageCommentsEntity } from '../entities/message-comments.entity'
import { MessagesEntity } from '../entities/messages.entity'
import { MessageInviteStatusEnum } from '../enums/message-invite-status.enum'
import { MessageTypeEnum } from '../enums/message-type.enum'

@Injectable()
export class MessagesService {
  private readonly alias = 'messages'
  private readonly repository: Repository<MessagesEntity>
  private readonly commentsRepository: Repository<MessageCommentsEntity>

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly filesService: FilesService,
  ) {
    this.repository = this.entityManager.getRepository(MessagesEntity)
    this.commentsRepository = this.entityManager.getRepository(MessageCommentsEntity)
  }

  async getChatMessages(chatId: string): Promise<MessagesEntity[]> {
    return this.repository
      .createQueryBuilder(this.alias)
      .withDeleted()
      .leftJoinAndSelect(`${this.alias}.repliedTo`, 'repliedTo')
      .leftJoinAndSelect(`${this.alias}.inviteChat`, 'inviteChat')
      .where(`${this.alias}.chatId = :chatId`, {
        chatId,
      })
      .loadRelationCountAndMap(
        `${this.alias}.commentsCount`,
        `${this.alias}.comments`,
        'commentsCount',
        (qb) => qb.withDeleted(),
      )
      .withDeleted()
      .orderBy(`${this.alias}.createdAt`, 'DESC')
      .getMany()
  }

  async getMessageComments(rootId: string): Promise<MessageCommentsEntity[]> {
    return this.commentsRepository.find({
      where: {
        rootId,
      },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        repliedTo: true,
      },
      withDeleted: true,
    })
  }

  async checkInvite(chatId: string, inviteChatId: string): Promise<boolean> {
    return !!(await this.repository.findOne({
      where: {
        type: MessageTypeEnum.INVITE,
        chatId,
        inviteChatId,
        inviteStatus: In([
          MessageInviteStatusEnum.ACCEPTED,
          MessageInviteStatusEnum.PENDING,
        ]),
      },
    }))
  }

  async invite(
    payload: InviteUserDTO,
    simpleUser: SimpleUser,
    chatId: string,
  ): Promise<MessagesEntity> {
    const message = this.repository.create({
      type: MessageTypeEnum.INVITE,
      text: 'Приглашение в группу',
      inviteChatId: payload.inviteChatId,
      simpleUser,
      userId: simpleUser.id,
      chatId: chatId,
      inviteStatus: MessageInviteStatusEnum.PENDING,
    })
    const messageId = (await this.repository.save(message)).id

    return this.repository.findOneOrFail({
      where: {
        id: messageId,
      },
      relations: {
        inviteChat: true,
      },
    })
  }

  async updateMessageInviteStatus(
    id: string,
    inviteStatus: MessageInviteStatusEnum,
  ): Promise<void> {
    await this.repository.save({ id, inviteStatus })
  }

  async create(
    payload: CreateMessageDTO,
    simpleUser: SimpleUser,
  ): Promise<MessagesEntity | MessageCommentsEntity> {
    console.log(payload)

    if (!payload.text && !payload.fileIds?.length) {
      throw new BadRequestException('Empty data for create message')
    }

    const files = payload.fileIds?.length
      ? await this.filesService.getSimpleFiles(payload.fileIds)
      : []

    if (payload.rootId) {
      const message = this.commentsRepository.create({
        ...payload,
        simpleUser,
        userId: simpleUser.id,
        type: MessageTypeEnum.DEFAULT,
        files,
        repliedTo:
          payload.repliedToId === null
            ? null
            : await this.commentsRepository
                .findOneOrFail({
                  where: {
                    id: payload.repliedToId,
                  },
                })
                .catch(() => null),
      })

      return this.commentsRepository.save(message)
    }

    const message = this.repository.create({
      ...payload,
      simpleUser,
      userId: simpleUser.id,
      type: MessageTypeEnum.DEFAULT,
      files,
      repliedTo:
        payload.repliedToId === null
          ? null
          : await this.repository
              .findOneOrFail({
                where: {
                  id: payload.repliedToId,
                },
              })
              .catch(() => null),
    })

    return this.repository.save(message)
  }

  async updateMessage(
    payload: UpdateMessageDTO,
  ): Promise<MessageCommentsEntity | MessagesEntity> {
    const { id, text, fileIds, isComment } = payload

    if (!text || !fileIds?.length) {
      throw new BadRequestException('Empty data for create message')
    }

    // TODO SAVE FILES
    if (isComment) {
      return this.commentsRepository.save({ id, text, isUpdated: true })
    }

    return this.repository.save({ id, text, isUpdated: true })
  }

  async remove(userId: string, payload: DeleteMessageDTO): Promise<void> {
    payload.isComment
      ? await this.commentsRepository.softDelete({
          id: payload.id,
          userId: userId,
          chatId: payload.chatId,
        })
      : await this.repository.softDelete({
          id: payload.id,
          userId: userId,
          chatId: payload.chatId,
        })
  }
}
