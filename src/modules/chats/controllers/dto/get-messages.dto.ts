import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsInt, IsNotEmpty, IsOptional } from 'class-validator'

export class GetMessagesDTO {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  currentMessagesIds: string[]

  @ApiProperty()
  @IsInt()
  @IsOptional()
  page?: number

  @ApiProperty()
  @IsInt()
  @IsOptional()
  limit?: number
}
