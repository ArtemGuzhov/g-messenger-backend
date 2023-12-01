import { Module } from '@nestjs/common'

import { FilesModule } from '../files/files.module'
import { UsersModule } from '../users/users.module'
import { MessagesControllerV1 } from './controllers/messages.controller.v1'
import { MessagesService } from './services/messages.service'

@Module({
  imports: [UsersModule, FilesModule],
  controllers: [MessagesControllerV1],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
