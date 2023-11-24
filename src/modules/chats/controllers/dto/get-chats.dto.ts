import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsPositive } from 'class-validator'

export class GetChatsDTO {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  currentChatsIds: string[]

  @ApiProperty()
  @IsPositive()
  @IsOptional()
  page?: number

  @ApiProperty()
  @IsPositive()
  @IsOptional()
  limit?: number
}
