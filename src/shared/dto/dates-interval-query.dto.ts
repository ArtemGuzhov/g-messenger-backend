import { ApiProperty } from '@nestjs/swagger'
import { IsISO8601, IsNotEmpty } from 'class-validator'

export class DatesIntervalQueryDTO {
  @ApiProperty()
  @IsISO8601()
  @IsNotEmpty()
  startDate: string

  @ApiProperty()
  @IsISO8601()
  @IsNotEmpty()
  endDate: string
}
