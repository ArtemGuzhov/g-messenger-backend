import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class ChatDTO {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  chatId: string
}
