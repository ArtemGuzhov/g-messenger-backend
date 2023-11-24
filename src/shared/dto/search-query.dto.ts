import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

import { PaginationQueryDTO } from './pagination-query.dto'

export class SearchQueryDTO extends PaginationQueryDTO {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  text?: string
}
