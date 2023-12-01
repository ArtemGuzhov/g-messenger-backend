/* eslint-disable @typescript-eslint/member-ordering */
import { BadRequestException, UnauthorizedException, UseGuards } from '@nestjs/common'
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

import { WsGetUserId } from '../../auth/decorators/ws-get-user-id.decorator'
import { WsAccessTokenGuard } from '../../auth/guards/ws-access-token.guard'
import { AuthService } from '../../auth/services/auth.service'
import { CreateMessageDTO } from '../../messages/dto/create-message.dto'
import { DeleteMessageDTO } from '../../messages/dto/delete-message.dto'
import { InviteUserDTO } from '../../messages/dto/invite-user.dto'
import { MessageInviteStatusEnum } from '../../messages/enums/message-invite-status.enum'
import { MessagesService } from '../../messages/services/messages.service'
import { UsersService } from '../../users/services/users.service'
import { AnswerOnInviteDTO } from '../dto/answer-on-invite.dto'
import { ChatIdDTO } from '../dto/chat-id.dto'
import { CreateChatDTO } from '../dto/create-chat.dto'
import { ChatEventsEnum } from '../enums/chat-events.enum'
import { ChatsService } from '../services/chats.service'

@UseGuards(WsAccessTokenGuard)
@WebSocketGateway()
export class ChatsGatewayV1
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server
  private readonly logger = new Logardian()
  private readonly sockets = new Map<string, string>()

  constructor(
    private readonly chatsService: ChatsService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
  ) {}

  async handleConnection(socket: Socket): Promise<void> {
    const userId = await this.getUserIdFromToken(socket).catch(() => null)

    if (userId === null) {
      socket.disconnect()
      return
    }

    try {
      this.sockets.set(userId, socket.id)
      this.joinRooms([userId], [socket])
      this.logger.log(
        { userId, socketId: socket.id },
        {
          label: 'connect',
        },
      )

      const [chatIds] = await Promise.all([
        this.chatsService.getUserChatIds(userId),
        this.usersService.updateOnline(userId, true),
      ])

      this.joinRooms([...chatIds, userId], [socket])
    } catch (e) {
      this.logger.error(
        { socketId: socket.id },
        {
          label: 'connect',
        },
      )
      await this.usersService.updateOnline(userId, false)
      socket.disconnect()
    }
  }
  async handleDisconnect(socket: Socket): Promise<void> {
    const userId = await this.getUserIdFromToken(socket).catch(() => null)

    if (userId === null) {
      socket.disconnect()
      return
    }

    try {
      socket.disconnect()
      this.sockets.delete(userId)
      await this.usersService.updateOnline(userId, false)

      this.logger.log(
        { userId, socketId: socket.id },
        {
          label: 'disconnect',
        },
      )
    } catch (err) {
      await this.usersService.updateOnline(userId, false)

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
    this.logger.log('Websocket start success (version: 1)')
  }

  @SubscribeMessage(ChatEventsEnum.CREATE_CHAT)
  async handleCreateChat(
    @WsGetUserId() userId: string,
    @MessageBody() payload: CreateChatDTO,
    isRedirect = true,
  ): Promise<string> {
    const isGroup = payload.userIds.length > 1

    if (!isGroup) {
      const profileId = payload.userIds[0]

      if (profileId) {
        const existChatId = await this.chatsService.checkExistDialog(userId, profileId)

        if (existChatId !== null) {
          isRedirect &&
            this.publishMessage({
              toRoom: userId,
              data: {
                chatId: existChatId,
              },
              event: ChatEventsEnum.IS_EXIST_CHAT,
            })
          return existChatId
        }
      }
    }

    const chat = await this.chatsService.create(userId, payload)

    this.joinRooms(
      [chat.id],
      [this.getSocket(userId), ...payload.userIds.map((id) => this.getSocket(id))],
    )
    this.publishMessage({
      toRoom: chat.id,
      data: chat,
      event: ChatEventsEnum.CREATED_CHAT,
    })

    return chat.id
  }

  @SubscribeMessage(ChatEventsEnum.LEAVE_GROUP)
  async handleLeaveGroup(
    @WsGetUserId() userId: string,
    @MessageBody() payload: ChatIdDTO,
  ): Promise<void> {
    await this.chatsService.leaveOrJoinGroup(payload.chatId, userId)
    this.publishMessage({
      toRoom: payload.chatId,
      data: {
        chatId: payload.chatId,
        userId,
      },
      event: ChatEventsEnum.LEFT_GROUP,
    })
  }

  @SubscribeMessage(ChatEventsEnum.CREATE_MESSAGE)
  async handleCreateMessage(
    @WsGetUserId() userId: string,
    @MessageBody() payload: CreateMessageDTO,
  ): Promise<void> {
    try {
      const simpleUser = await this.usersService.getSimpleUser(userId)
      const message = await this.messagesService.create(payload, simpleUser)
      const isNotReadMessagesCount =
        await this.chatsService.getChatIsNotReadMessagesCount(payload.chatId, userId)
      this.publishMessage({
        toRoom: payload.chatId,
        data: {
          message: { ...message },
          chatId: payload.chatId,
          clientId: payload.clientId,
        },
        event: ChatEventsEnum.CREATED_MESSAGE,
      })
      this.publishMessage({
        toRoom: payload.chatId,
        data: {
          isNotReadMessagesCount,
          chatId: payload.chatId,
        },
        event: ChatEventsEnum.IS_NOT_READ_MESSAGES_COUNT,
      })
    } catch (error) {
      console.log(error)
      this.logger.error(error, { label: this.handleCreateChat.name })
      this.publishMessage({
        toRoom: userId,
        data: {
          clientId: payload.clientId,
          chatId: payload.chatId,
          rootId: payload.rootId,
        },
        event: ChatEventsEnum.CREATE_MESSAGE_ERROR,
      })
    }
  }

  @SubscribeMessage(ChatEventsEnum.DELETE_MESSAGE)
  async handleDeleteMessage(
    @WsGetUserId() userId: string,
    @MessageBody() payload: DeleteMessageDTO,
  ): Promise<void> {
    await this.messagesService.remove(userId, payload)
    this.publishMessage({
      toRoom: payload.chatId,
      data: payload,
      event: ChatEventsEnum.DELETED_MESSAGE,
    })
  }

  @SubscribeMessage(ChatEventsEnum.INVITE_USER)
  async handleInviteUserInGroup(
    @WsGetUserId() userId: string,
    @MessageBody() payload: InviteUserDTO,
  ): Promise<void> {
    try {
      const chatId = await this.handleCreateChat(
        userId,
        {
          userIds: [payload.profileId],
        },
        false,
      )
      const isExistInvite = await this.messagesService.checkInvite(
        chatId,
        payload.inviteChatId,
      )
      const isExistInGroup = await this.chatsService.checkUserExistInGroup(
        payload.inviteChatId,
        payload.profileId,
      )

      if (!isExistInvite && !isExistInGroup) {
        const simpleUser = await this.usersService.getSimpleUser(userId)
        const message = await this.messagesService.invite(payload, simpleUser, chatId)
        await this.chatsService.addOrDelUserFromExpectedChat(
          payload.inviteChatId,
          payload.profileId,
        )
        const isNotReadMessagesCount =
          await this.chatsService.getChatIsNotReadMessagesCount(chatId, userId)
        this.publishMessage({
          toRoom: chatId,
          data: {
            message: { ...message },
            chatId: chatId,
            clientId: payload.clientId,
          },
          event: ChatEventsEnum.CREATED_MESSAGE,
        })
        this.publishMessage({
          toRoom: chatId,
          data: {
            isNotReadMessagesCount,
            chatId,
          },
          event: ChatEventsEnum.IS_NOT_READ_MESSAGES_COUNT,
        })

        const simpleProfile = await this.usersService.getSimpleUser(payload.profileId)
        this.publishMessage({
          toRoom: userId,
          data: {
            clientId: payload.clientId,
            profile: {
              ...simpleProfile,
              isExpect: true,
            },
          },
          event: ChatEventsEnum.INVITE_SENT,
        })
        return
      }

      throw new BadRequestException()
    } catch {
      this.publishMessage({
        toRoom: userId,
        data: {
          clientId: payload.clientId,
          profileId: payload.profileId,
        },
        event: ChatEventsEnum.INVITE_ERROR,
      })
    }
  }

  @SubscribeMessage(ChatEventsEnum.ANSWER_ON_INVITE)
  async handleAnswerOnInvite(
    @WsGetUserId() userId: string,
    @MessageBody() payload: AnswerOnInviteDTO,
  ): Promise<void> {
    console.log(payload)
    const isParticipant = await this.chatsService.checkUserExistInParticipants(
      payload.inviteChatId,
      userId,
    )

    if (!isParticipant && payload.inviteStatus === MessageInviteStatusEnum.ACCEPTED) {
      await this.chatsService.leaveOrJoinGroup(payload.inviteChatId, userId)
    }

    await this.chatsService.addOrDelUserFromExpectedChat(payload.inviteChatId, userId)

    await this.messagesService.updateMessageInviteStatus(
      payload.messageId,
      payload.inviteStatus,
    )

    if (payload.inviteStatus === MessageInviteStatusEnum.ACCEPTED) {
      const simpleUser = await this.usersService.getSimpleUser(userId)
      const chat = (
        await this.chatsService.getUserChats(userId, [payload.inviteChatId])
      )[0]
      this.joinRooms([payload.inviteChatId], [this.getSocket(userId)])
      this.publishMessage({
        toRoom: payload.inviteChatId,
        data: {
          chatId: payload.inviteChatId,
          simpleUser,
        },
        event: ChatEventsEnum.ACCEPT_INVITE,
      })

      this.publishMessage({
        toRoom: payload.chatId,
        data: {
          chatId: payload.chatId,
          messageId: payload.messageId,
          chat,
          userId,
        },
        event: ChatEventsEnum.ACCEPT_INVITE,
      })

      return
    }

    if (payload.inviteStatus === MessageInviteStatusEnum.REJECTED) {
      this.publishMessage({
        toRoom: payload.inviteChatId,
        data: {
          chatId: payload.inviteChatId,
          userId,
          messageId: payload.messageId,
        },
        event: ChatEventsEnum.REJECT_INVITE,
      })
      this.publishMessage({
        toRoom: payload.chatId,
        data: {
          chatId: payload.chatId,
          messageId: payload.messageId,
        },
        event: ChatEventsEnum.REJECT_INVITE,
      })

      return
    }
  }

  private publishMessage(payload: {
    toRoom: string
    data: unknown
    event: ChatEventsEnum
  }): void {
    this.server.to(payload.toRoom).emit(payload.event, payload.data)
  }

  private joinRooms(rooms: string[], sockets: Socket[]): void {
    sockets.forEach((socket) => {
      if (socket) {
        socket.join(rooms)
      }
    })
  }

  private getSocket(userId: string): Socket {
    return (this.server.sockets.sockets as any).get(this.sockets.get(userId))
  }

  private async getUserIdFromToken(socket: Socket): Promise<string | null> {
    const accessToken = socket.handshake.headers.authorization
    if (!accessToken) {
      throw new UnauthorizedException()
    }
    const jwt = await this.authService.verifyJwt(accessToken)

    if (jwt === null) {
      return null
    }

    return jwt.userId
  }
}
