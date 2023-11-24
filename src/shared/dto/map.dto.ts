import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator'

import { CoordinatesDTO } from './coordinates.dto'

export class MapDTO {
  @ApiProperty()
  @Type(() => CoordinatesDTO)
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  leftEdge: CoordinatesDTO

  @ApiProperty()
  @Type(() => CoordinatesDTO)
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  rightEdge: CoordinatesDTO
}
