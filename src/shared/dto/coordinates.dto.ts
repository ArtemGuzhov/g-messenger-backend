import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class CoordinatesDTO {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  longitude: number

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  latitude: number
}
