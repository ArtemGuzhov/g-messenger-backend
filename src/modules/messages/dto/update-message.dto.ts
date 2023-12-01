import { OmitType } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator'

import { CreateMessageDTO } from './create-message.dto'

export class UpdateMessageDTO extends OmitType(CreateMessageDTO, [
  'repliedToId',
  'chatId',
]) {
  @IsUUID(4)
  @IsNotEmpty()
  id: string

  @IsBoolean()
  @IsOptional()
  isComment?: boolean
}
