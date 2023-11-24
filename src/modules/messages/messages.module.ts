import { Module } from '@nestjs/common'

import { FilesModule } from '../files/files.module'
import { UsersModule } from '../users/users.module'
import { MessagesService } from './services/messages.service'

@Module({
  imports: [UsersModule, FilesModule],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
