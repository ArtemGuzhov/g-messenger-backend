import { Controller, Get, Param } from '@nestjs/common'

import { MessageCommentsEntity } from '../entities/message-comments.entity'
import { MessagesEntity } from '../entities/messages.entity'
import { MessagesService } from '../services/messages.service'

@Controller({
  version: '1',
  path: 'messages',
})
export class MessagesControllerV1 {
  constructor(private readonly messagesService: MessagesService) {}

  @Get(':chatId')
  async getChatMessages(@Param('chatId') chatId: string): Promise<MessagesEntity[]> {
    return this.messagesService.getChatMessages(chatId)
  }

  @Get('comments/:rootId')
  async getMessageComments(
    @Param('rootId') rootId: string,
  ): Promise<MessageCommentsEntity[]> {
    return this.messagesService.getMessageComments(rootId)
  }
}
