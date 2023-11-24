import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateChatDTO {
  @ApiProperty()
  @IsUUID(4, { each: true })
  @IsNotEmpty()
  userIds: string[]

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string
}
