import { HttpStatus } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export abstract class CommonResponseRTO<T> {
  @ApiProperty({ enum: HttpStatus })
  code: HttpStatus

  @ApiPropertyOptional()
  message?: string[]

  @ApiProperty({ nullable: true })
  abstract data: T | null

  @ApiProperty({ nullable: true, default: null })
  error: string | null
}
