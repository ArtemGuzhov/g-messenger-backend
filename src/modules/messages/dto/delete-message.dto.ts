import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator'

import { ChatIdDTO } from '../../chats/dto/chat-id.dto'

export class DeleteMessageDTO extends ChatIdDTO {
  @IsUUID(4)
  @IsNotEmpty()
  id: string

  @IsBoolean()
  @IsNotEmpty()
  isComment: boolean
}
