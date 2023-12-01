import { IsNotEmpty, IsUUID } from 'class-validator'

export class ChatIdDTO {
  @IsUUID(4)
  @IsNotEmpty()
  chatId: string
}
