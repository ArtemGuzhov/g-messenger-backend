import { Controller, Get, Param } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { GetJwtPayload } from '../../auth/decorators/get-jwt-payload.decorator'
import { JwtPayload } from '../../auth/services/interfaces/jwt-payload.interface'
import { UsersEntity } from '../../users/entities/users.entity'
import { ChatsEntity } from '../entities/chats.entity'
import { ChatsService } from '../services/chats.service'

@ApiTags('Chats')
@ApiBearerAuth('JWT-auth')
@Controller({
  version: '1',
  path: 'chats',
})
export class ChatsControllerV1 {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  async getChats(@GetJwtPayload() jwtPayload: JwtPayload): Promise<ChatsEntity[]> {
    return this.chatsService.getUserChats(jwtPayload.userId)
  }

  @Get('users/:chatId')
  async getChatUsers(@Param('chatId') chatId: string): Promise<UsersEntity[]> {
    return this.chatsService.getChatUsers(chatId)
  }

  // @Get(':chatId')
  // async getChatById(
  //   @Param('chatId', ParseUUIDPipe) chatId: string,
  //   @GetJwtPayload() jwtPayload: JwtPayload,
  // ): Promise<ChatsEntity> {
  //   return this.chatsService.getChatWithLastMessage(chatId, jwtPayload.userId)
  // }
  // @Get('dialog/:profileId')
  // async getChatIdBetweenUsers(
  //   @Param('profileId', ParseUUIDPipe) profileId: string,
  //   @GetJwtPayload() jwtPayload: JwtPayload,
  // ): Promise<Pick<ChatsEntity, 'id'>> {
  //   return this.chatsService.getChatIdBetweenUsers(jwtPayload.userId, profileId)
  // }
  // @Get('search')
  // async getChatsBySearch(
  //   @Query() query: SearchQueryDTO,
  //   @GetJwtPayload() jwtPayload: JwtPayload,
  // ): Promise<ListResponse<ChatsEntity>> {
  //   return this.chatsService.getChatsBySearch(jwtPayload.userId, query.text ?? '', query)
  // }
  // @Get('messages/search/:chatId')
  // async getChatMessagesBySerach(
  //   @Param('chatId', ParseUUIDPipe) chatId: string,
  //   @Query() query: SearchQueryDTO,
  // ): Promise<ListResponse<MessagesEntity>> {
  //   return this.chatsService.getChatsMessagesBySearch(chatId, query.text ?? '', query)
  // }
  // @Post('list')
  // async getUserChats(
  //   @GetJwtPayload() jwtPayload: JwtPayload,
  //   @Body() body: GetChatsDTO,
  // ): Promise<ListResponse<ChatsEntity>> {
  //   return this.chatsService.getUserChats(jwtPayload.userId, body)
  // }
  // @Post('messages/:chatId')
  // async getChatMessages(
  //   @Param('chatId', ParseUUIDPipe) chatId: string,
  //   @Body() body: GetMessagesDTO,
  //   @GetJwtPayload() jwtPayload: JwtPayload,
  // ): Promise<ListResponse<MessagesEntity>> {
  //   return this.chatsService.getChatMessages(chatId, jwtPayload.userId, body)
  // }
}
