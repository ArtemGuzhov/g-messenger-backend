import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty } from 'class-validator'

import { ChatDTO } from './chat.dto'

export class ReadMessagesDTO extends ChatDTO {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  messagesIds: string[]
}
