import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GetJwtPayload } from 'src/modules/auth/decorators/get-jwt-payload.decorator'
import { IJwtPayload } from 'src/modules/auth/services/interfaces/jwt-payload.interface'
import { MessagesEntity } from 'src/modules/messages/entities/messages.entity'
import { ListResponse } from 'src/shared/interfaces/list-response.interface'

import { SearchQueryDTO } from '../../../shared/dto/search-query.dto'
import { ChatsEntity } from '../entities/chats.entity'
import { ChatsService } from '../services/chats.service'
import { GetChatsDTO } from './dto/get-chats.dto'
import { GetMessagesDTO } from './dto/get-messages.dto'

@ApiTags('Chats')
@ApiBearerAuth('JWT-auth')
@Controller({
  version: '1',
  path: 'chats',
})
export class ChatsControllerV1 {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  async getChats(@GetJwtPayload() jwtPayload: IJwtPayload): Promise<ChatsEntity[]> {
    return this.chatsService.getChats(jwtPayload.userId)
  }

  @Get(':chatId')
  async getChatById(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @GetJwtPayload() jwtPayload: IJwtPayload,
  ): Promise<ChatsEntity> {
    return this.chatsService.getChatWithLastMessage(chatId, jwtPayload.userId)
  }

  @Get('dialog/:profileId')
  async getChatIdBetweenUsers(
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @GetJwtPayload() jwtPayload: IJwtPayload,
  ): Promise<Pick<ChatsEntity, 'id'>> {
    return this.chatsService.getChatIdBetweenUsers(jwtPayload.userId, profileId)
  }

  @Get('search')
  async getChatsBySearch(
    @Query() query: SearchQueryDTO,
    @GetJwtPayload() jwtPayload: IJwtPayload,
  ): Promise<ListResponse<ChatsEntity>> {
    return this.chatsService.getChatsBySearch(jwtPayload.userId, query.text ?? '', query)
  }

  @Get('messages/search/:chatId')
  async getChatMessagesBySerach(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Query() query: SearchQueryDTO,
  ): Promise<ListResponse<MessagesEntity>> {
    return this.chatsService.getChatsMessagesBySearch(chatId, query.text ?? '', query)
  }

  @Post('list')
  async getUserChats(
    @GetJwtPayload() jwtPayload: IJwtPayload,
    @Body() body: GetChatsDTO,
  ): Promise<ListResponse<ChatsEntity>> {
    return this.chatsService.getUserChats(jwtPayload.userId, body)
  }

  @Post('messages/:chatId')
  async getChatMessages(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() body: GetMessagesDTO,
    @GetJwtPayload() jwtPayload: IJwtPayload,
  ): Promise<ListResponse<MessagesEntity>> {
    return this.chatsService.getChatMessages(chatId, jwtPayload.userId, body)
  }
}
