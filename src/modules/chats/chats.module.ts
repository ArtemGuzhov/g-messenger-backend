import { Module } from '@nestjs/common'
import { ChatsService } from './services/chats.service'

@Module({
  providers: [ChatsService],
})
export class ChatsModule {}
