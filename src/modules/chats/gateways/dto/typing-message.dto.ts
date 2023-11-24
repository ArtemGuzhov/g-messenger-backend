import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty } from 'class-validator'

import { ChatDTO } from './chat.dto'

export class TypingMessageDTO extends ChatDTO {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isTyping: boolean
}
