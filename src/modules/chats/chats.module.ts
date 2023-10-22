import { Module } from '@nestjs/common'
import { ChatsService } from './services/chats.service'
import { ChatsQueriesResolver } from './resolvers/chats-queries.resolver'

@Module({
  providers: [ChatsService, ChatsQueriesResolver],
})
export class ChatsModule {}
