import { MessagesEntity } from 'src/modules/messages/entities/messages.entity'

export class CreateMessageRTO {
  newMessage: MessagesEntity
  chatId: string
  userId: string
}
