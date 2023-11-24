import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID } from 'class-validator'

import { ChatDTO } from './chat.dto'

export class MessageDTO extends ChatDTO {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  messageId: string
}
