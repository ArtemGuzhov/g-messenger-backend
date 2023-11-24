import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  // IsUUID,
} from 'class-validator'

import { MessageTypeEnum } from '../../../messages/enums/message-type.enum'
import { ChatDTO } from './chat.dto'

export class CreateMessageDTO extends ChatDTO {
  @ApiProperty({ enum: MessageTypeEnum })
  @IsEnum(MessageTypeEnum)
  @IsNotEmpty()
  type: MessageTypeEnum

  @ApiProperty()
  @IsString()
  @IsOptional()
  text?: string

  @ApiProperty()
  @IsArray()
  @IsOptional()
  filesIds?: string[]

  // @ApiProperty()
  // @IsUUID(4)
  // @IsNotEmpty()
  // clientMessageId: string
}
