import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsOptional, IsPositive } from 'class-validator'

export class PaginationQueryDTO {
  @ApiProperty({ required: false })
  @Transform(({ value }) => Number(value))
  @IsPositive()
  @IsOptional()
  page?: number

  @ApiProperty({ required: false })
  @Transform(({ value }) => Number(value))
  @IsPositive()
  @IsOptional()
  limit?: number
}
