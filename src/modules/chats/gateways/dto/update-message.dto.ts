import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID } from 'class-validator'

import { CreateMessageDTO } from './create-message.dto'

export class UpdateMessageDTO extends OmitType(CreateMessageDTO, ['type']) {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string
}
