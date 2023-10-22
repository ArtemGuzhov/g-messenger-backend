import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { ChatQueriesType } from '../graphql/types/chat-queries.type'
import { ChatsService } from '../services/chats.service'
import { ChatWithMessagesType } from '../graphql/types/chat.type'
import { UseGuards } from '@nestjs/common'
import { JwtGuard } from 'src/modules/auth/guards/jwt.guard'
import { GetJwtPayload } from 'src/shared/decorators/get-jwt-payload.decorator'
import { JwtPayload } from 'src/modules/auth/interfaces/jwt-payload.interface'

@Resolver(() => ChatQueriesType)
export class ChatsQueriesResolver {
  constructor(private readonly chatsService: ChatsService) {}

  @Query(() => ChatQueriesType)
  async chat(): Promise<ChatQueriesType> {
    return {}
  }

  @UseGuards(JwtGuard)
  @ResolveField(() => [ChatWithMessagesType])
  async getChatsByUserId(
    @Parent() _parent: ChatQueriesType,
    @GetJwtPayload() jwtPayload: JwtPayload,
  ): Promise<ChatWithMessagesType[]> {
    return this.chatsService.getChatsByUserId(jwtPayload.userId)
  }
}
