/* eslint-disable @typescript-eslint/member-ordering */
import { UnauthorizedException, UseGuards } from '@nestjs/common'
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Logardian } from 'logardian'
import { Server, Socket } from 'socket.io'

import { AuthService } from '../../../modules/auth/services/auth.service'
import { WsGetUserId } from '../../auth/decorators/ws-get-user-id.decorator'
import { WsAccessTokenGuard } from '../../auth/guards/ws-access-token.guard'
import { MessageStatusEnum } from '../../messages/enums/message-status.enum'
import { ChatsEntity } from '../entities/chats.entity'
import { ChatEventsEnum } from '../enums/chat-events.enum'
import { ChatsService } from '../services/chats.service'
import { ChatDTO } from './dto/chat.dto'
import { CreateChatDTO } from './dto/create-chat.dto'
import { CreateGroupChatDTO } from './dto/create-group-chat.dto'
import { CreateMessageDTO } from './dto/create-message.dto'
import { MessageDTO } from './dto/message.dto'
import { ReadMessagesDTO } from './dto/read-messages.dto'
import { TypingMessageDTO } from './dto/typing-message.dto'
import { UpdateMessageDTO } from './dto/update-message.dto'
import { UpdateMessageStatusDTO } from './dto/update-message-status.dto'
import { CreateMessageRTO } from './rto/create-message.rto'
import { DeletedMessageRTO } from './rto/deleted-message.rto'
import { ReadMessagesRTO } from './rto/read-messages.rto'
import { UnreadedChatsCountRTO } from './rto/unreaded-chats.rto'
import { UpdateMessagesStatusResponse } from './rto/update-messages-status.rto'
import { UpdatedMessageRTO } from './rto/updated-message.rto'
import { UserTypingMessageRTO } from './rto/user-typing-message.rto'

@UseGuards(WsAccessTokenGuard)
@WebSocketGateway({
  namespace: 'chats',
})
export class ChatsGatewayV1
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server

  private readonly logger = new Logardian()
  private readonly sockets = new Map<string, string>()

  constructor(
    private readonly chatsService: ChatsService,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(socket: Socket): Promise<void> {
    const userId = await this.getUserIdFromToken(socket)

    try {
      this.sockets.set(userId, socket.id)
      this.joinRooms([userId], [socket])
      this.logger.log(
        { userId, socketId: socket.id },
        {
          label: 'connect',
        },
      )

      const [chatsIds] = await Promise.all([
        this.chatsService.getUserChatsIds(userId),

        this.emitUnreadedChatsCountForOneUser(userId),
      ])
      this.chatsService.updateOnline(userId, true)
      this.joinRooms([...chatsIds, userId], [socket])
    } catch (e) {
      this.logger.error(
        { socketId: socket.id },
        {
          label: 'connect',
        },
      )
      this.chatsService.updateOnline(userId, false)
      socket.disconnect()
    }
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    const userId = await this.getUserIdFromToken(socket)

    try {
      socket.disconnect()
      this.sockets.delete(userId)
      this.chatsService.updateOnline(userId, false)

      this.logger.log(
        { userId, socketId: socket.id },
        {
          label: 'disconnect',
        },
      )
    } catch (err) {
      this.chatsService.updateOnline(userId, false)
      this.logger.error(
        {
          err,
        },
        {
          label: this.handleDisconnect.name,
        },
      )
    }
  }

  async afterInit(): Promise<void> {
    this.logger.log('ChatsGatewayV1 chats {/chats} (version: 1)')
  }

  @SubscribeMessage(ChatEventsEnum.CREATE_CHAT)
  async handleCreateDialog(
    @WsGetUserId() userId: string,
    @MessageBody() payload: CreateChatDTO,
  ): Promise<void> {
    const chat = await this.chatsService.createChat(userId, payload)

    this.logger.log(
      {
        userId,
        socketId: this.getSocket(userId).id,
        payload,
      },
      {
        label: ChatEventsEnum.CREATE_CHAT,
      },
    )

    this.joinRooms(
      [chat.id],
      [this.getSocket(userId), ...payload.userIds.map((id) => this.getSocket(id))],
    )
    this.publishCreatedChat(chat.id, chat)
  }

  @SubscribeMessage(ChatEventsEnum.CREATE_GROUP_CHAT)
  async handleCreateGroupChat(
    @WsGetUserId() userId: string,
    @MessageBody()
    payload: CreateGroupChatDTO,
  ): Promise<void> {
    const { profilesIds, name } = payload
    const newChat = await this.chatsService.createGroupChat(userId, profilesIds, name)

    this.logger.log(
      {
        userId,
        socketId: this.getSocket(userId).id,
        payload,
      },
      {
        label: ChatEventsEnum.CREATE_GROUP_CHAT,
      },
    )

    this.joinRooms(
      [newChat.id],
      [
        this.getSocket(userId),
        ...profilesIds.map((profileId) => this.getSocket(profileId)),
      ],
    )
    this.publishCreatedChat(newChat.id, newChat)
  }

  @SubscribeMessage(ChatEventsEnum.CREATE_MESSAGE)
  async handleCreateMessage(
    @WsGetUserId() userId: string,
    @MessageBody() payload: CreateMessageDTO,
  ): Promise<void> {
    try {
      // this.server.to(userId).emit(ChatEventsEnum.CREATE_MESSAGE, {
      //   clientMessageId: payload.clientMessageId,
      //   chatId: payload.chatId,
      //   status: MessageStatusEnum.SENDING,
      // })

      const data = await this.chatsService.createMessage(userId, payload)

      this.server.to(userId).emit(ChatEventsEnum.CREATE_MESSAGE, {
        id: data.newMessage.id,
        // clientMessageId: payload.clientMessageId,
        chatId: payload.chatId,
        status: MessageStatusEnum.SENT,
      })

      this.logger.log(
        {
          userId,
          socketId: this.getSocket(userId).id,
          payload,
        },
        {
          label: ChatEventsEnum.CREATED_MESSAGE,
        },
      )

      this.publishCreatedMessage(payload.chatId, data)
      await this.emitUnreadedChatsCountForUsersInChat(payload.chatId)
    } catch (err) {
      this.logger.error({ err }, { label: this.handleCreateMessage.name })
      // this.server.to(userId).emit(ChatEventsEnum.CREATE_MESSAGE, {
      //   clientMessageId: payload.clientMessageId,
      //   chatId: payload.chatId,
      //   status: MessageStatusEnum.ERROR,
      // })
    }
  }

  @SubscribeMessage(ChatEventsEnum.READ_MESSAGES)
  async handleReadMessage(
    @WsGetUserId() userId: string,
    @MessageBody() payload: ReadMessagesDTO,
  ): Promise<void> {
    const { chatId, messagesIds } = payload
    const readMessages = await this.chatsService.readChatMessages(
      chatId,
      userId,
      messagesIds,
    )

    this.logger.log(
      {
        userId,
        socketId: this.getSocket(userId).id,
        payload,
      },
      {
        label: ChatEventsEnum.READ_MESSAGES,
      },
    )

    this.publishReadedMessages(chatId, readMessages)
    await this.emitUnreadedChatsCountForOneUser(userId)
  }

  @SubscribeMessage(ChatEventsEnum.TYPING_MESSAGE)
  async handleTypingMessage(
    @WsGetUserId() userId: string,
    @MessageBody() payload: TypingMessageDTO,
  ): Promise<void> {
    this.logger.log(
      {
        userId,
        socketId: this.getSocket(userId).id,
        payload,
      },
      {
        label: ChatEventsEnum.TYPING_MESSAGE,
      },
    )

    this.publishUserTypingMessage(payload.chatId, { userId, ...payload })
  }

  @SubscribeMessage(ChatEventsEnum.EDIT_MESSAGE)
  async handleEditMessage(
    @WsGetUserId() userId: string,
    @MessageBody() payload: UpdateMessageDTO,
  ): Promise<void> {
    const editedMessage = await this.chatsService.editMessage(userId, payload)

    this.logger.log(
      {
        userId,
        socketId: this.getSocket(userId).id,
        payload,
      },
      {
        label: ChatEventsEnum.EDIT_MESSAGE,
      },
    )

    this.publishEditedMessage(payload.chatId, editedMessage)
  }

  @SubscribeMessage(ChatEventsEnum.DELETE_MESSAGE)
  async handleDeleteMessage(
    @WsGetUserId() userId: string,
    @MessageBody() payload: MessageDTO,
  ): Promise<void> {
    await this.chatsService.deleteMessage(userId, payload)

    this.logger.log(
      {
        userId,
        socketId: this.getSocket(userId).id,
        payload,
      },
      {
        label: ChatEventsEnum.DELETED_MESSAGE,
      },
    )

    this.publishDeletedMessage(payload.chatId, payload)
    await this.emitUnreadedChatsCountForUsersInChat(payload.chatId)
  }

  @SubscribeMessage(ChatEventsEnum.DELETE_CHAT)
  async handleDeleteChat(
    @WsGetUserId() userId: string,
    @MessageBody() payload: ChatDTO,
  ): Promise<void> {
    const chatId = payload.chatId
    await this.chatsService.deleteDialog(chatId, userId)

    this.logger.log(
      {
        userId,
        socketId: this.getSocket(userId).id,
        payload,
      },
      {
        label: ChatEventsEnum.DELETE_CHAT,
      },
    )

    this.publishDeletedChat(chatId, {
      id: chatId,
    })
    await this.emitUnreadedChatsCountForUsersInChat(payload.chatId)
  }

  @SubscribeMessage(ChatEventsEnum.CLEAR_CHAT)
  async handleClearChat(
    @WsGetUserId() userId: string,
    @MessageBody() payload: ChatDTO,
  ): Promise<void> {
    const chatId = payload.chatId
    const clearedChat = await this.chatsService.clearChat(chatId, userId)

    this.logger.log(
      {
        userId,
        socketId: this.getSocket(userId).id,
        payload,
      },
      {
        label: ChatEventsEnum.CLEAR_CHAT,
      },
    )

    this.publishClearedChat(chatId, clearedChat)
    await this.emitUnreadedChatsCountForUsersInChat(payload.chatId)
  }

  @SubscribeMessage(ChatEventsEnum.CHANGE_STATUSES_MESSAGES)
  async handleChangeStatusMessage(
    @WsGetUserId() userId: string,
    @MessageBody() payload: UpdateMessageStatusDTO,
  ): Promise<void> {
    const { chatId, messagesIds } = payload

    const updatedMessages = await this.chatsService.changeMessageStatus(
      chatId,
      messagesIds,
      userId,
      payload.status,
    )

    this.logger.log(
      {
        userId,
        socketId: this.getSocket(userId).id,
        payload,
      },
      {
        label: ChatEventsEnum.CHANGE_STATUSES_MESSAGES,
      },
    )

    this.publishChangedStatusMessage(chatId, {
      updatedMessages: updatedMessages,
    })
  }

  // private publishChats(recipientId: string, response: ListResponse<ChatsEntity>): void {
  //   this.server.to(recipientId).emit(ChatEventsEnum.ACTIVE_CHATS, response)
  //   this.logger.log({ recipientId, response }, { label: ChatEventsEnum.CHATS })
  // }

  private publishUnreadedChatsCount(
    recipientId: string,
    response: UnreadedChatsCountRTO,
  ): void {
    this.server.to(recipientId).emit(ChatEventsEnum.UNREADED_CHATS_COUNT, response)
    this.logger.log(
      { recipientId, response },
      { label: ChatEventsEnum.UNREADED_CHATS_COUNT },
    )
  }

  private publishCreatedChat(recipientId: string, response: ChatsEntity): void {
    this.server.to(recipientId).emit(ChatEventsEnum.CREATED_CHAT, response)
    this.logger.log({ recipientId, response }, { label: ChatEventsEnum.CREATED_CHAT })
  }

  private publishCreatedMessage(recipientId: string, response: CreateMessageRTO): void {
    this.server.to(recipientId).emit(ChatEventsEnum.CREATED_MESSAGE, response)
    this.logger.log({ recipientId, response }, { label: ChatEventsEnum.CREATED_MESSAGE })
  }

  private publishEditedMessage(recipientId: string, response: UpdatedMessageRTO): void {
    this.server.to(recipientId).emit(ChatEventsEnum.EDITED_MESSAGE, response)
    this.logger.log({ recipientId, response }, { label: ChatEventsEnum.EDITED_MESSAGE })
  }

  private publishDeletedMessage(recipientId: string, response: DeletedMessageRTO): void {
    this.server.to(recipientId).emit(ChatEventsEnum.DELETED_MESSAGE, response)
    this.logger.log({ recipientId, response }, { label: ChatEventsEnum.DELETED_MESSAGE })
  }

  private publishReadedMessages(recipientId: string, response: ReadMessagesRTO): void {
    this.server.to(recipientId).emit(ChatEventsEnum.READED_MESSAGES, response)
    this.logger.log({ recipientId, response }, { label: ChatEventsEnum.READED_MESSAGES })
  }

  private publishChangedStatusMessage(
    recipientId: string,
    response: UpdateMessagesStatusResponse,
  ): void {
    this.server.to(recipientId).emit(ChatEventsEnum.CHANGED_STATUSES_MESSAGES, response)
    this.logger.log(
      { recipientId, response },
      { label: ChatEventsEnum.CHANGED_STATUSES_MESSAGES },
    )
  }

  private publishUserTypingMessage(
    recipientId: string,
    response: UserTypingMessageRTO,
  ): void {
    this.server.to(recipientId).emit(ChatEventsEnum.USER_TYPING_MESSAGE, response)
    this.logger.log(
      { recipientId, response },
      { label: ChatEventsEnum.USER_TYPING_MESSAGE },
    )
  }

  // private publishUpdatedChat(recipientId: string, response: ChatsEntity): void {
  //   this.server.to(recipientId).emit(ChatEventsEnum.UPDATED_CHAT, response)
  //   this.logger.log({ recipientId, response }, { label: ChatEventsEnum.UPDATED_CHAT })
  // }

  private publishDeletedChat(
    recipientId: string,
    response: Pick<ChatsEntity, 'id'>,
  ): void {
    this.server.to(recipientId).emit(ChatEventsEnum.DELETED_CHAT, response)
    this.logger.log({ recipientId, response }, { label: ChatEventsEnum.DELETED_CHAT })
  }

  private publishClearedChat(recipientId: string, response: ChatsEntity): void {
    this.server.to(recipientId).emit(ChatEventsEnum.CLEARED_CHAT, response)
    this.logger.log({ recipientId, response }, { label: ChatEventsEnum.CLEARED_CHAT })
  }

  private joinRooms(rooms: string[], sockets: Socket[]): void {
    sockets.forEach((socket) => {
      if (socket) {
        socket.join(rooms)
      }
    })
  }

  private async emitUnreadedChatsCountForUsersInChat(chatId: string): Promise<void> {
    const users = await this.chatsService.getUsersIdInChat(chatId)
    await Promise.all(
      users.map((id) => {
        return this.emitUnreadedChatsCountForOneUser(id)
      }),
    )
  }

  private async emitUnreadedChatsCountForOneUser(userId: string): Promise<void> {
    const unreadedChatsCount = await this.chatsService.getUserUnreadedChatsCount(userId)
    this.publishUnreadedChatsCount(userId, unreadedChatsCount)
  }

  private getSocket(userId: string): Socket {
    return (this.server.sockets as any).get(this.sockets.get(userId))
  }

  private async getUserIdFromToken(socket: Socket): Promise<string> {
    const accessToken = socket.handshake.headers.authorization
    if (!accessToken) {
      throw new UnauthorizedException()
    }

    const { userId } = await this.authService.verifyJwt(accessToken)
    return userId
  }
}
