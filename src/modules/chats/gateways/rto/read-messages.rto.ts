import { MessagesEntity } from 'src/modules/messages/entities/messages.entity'

export class ReadMessagesRTO {
  readMessages: MessagesEntity[]
  chatId: string
}
