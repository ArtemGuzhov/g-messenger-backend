import { MessagesEntity } from 'src/modules/messages/entities/messages.entity'

export class UpdatedMessageRTO {
  updatedMessage: MessagesEntity
  chatId: string
  userId: string
}
