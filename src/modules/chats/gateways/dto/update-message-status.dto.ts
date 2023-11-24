import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty } from 'class-validator'

import { MessageStatusEnum } from '../../../messages/enums/message-status.enum'
import { ReadMessagesDTO } from './read-messages.dto'

export class UpdateMessageStatusDTO extends ReadMessagesDTO {
  @ApiProperty({ enum: MessageStatusEnum })
  @IsEnum(MessageStatusEnum)
  @IsNotEmpty()
  status: MessageStatusEnum
}
