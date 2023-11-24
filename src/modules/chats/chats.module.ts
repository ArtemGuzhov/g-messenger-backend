import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { MessagesModule } from '../messages/messages.module'
import { UsersModule } from '../users/users.module'
import { ChatsControllerV1 } from './controllers/chats.controller.v1'
import { ChatsGatewayV1 } from './gateways/chats.gateway.v1'
import { ChatsService } from './services/chats.service'

@Module({
  imports: [UsersModule, AuthModule, MessagesModule],
  providers: [ChatsService, ChatsGatewayV1],
  controllers: [ChatsControllerV1],
  exports: [ChatsService],
})
export class ChatsModule {}
