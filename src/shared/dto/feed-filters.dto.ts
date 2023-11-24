import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator'

import { PostsFilterDTO } from './posts-filter.dto'

class CustomDistanceFilterDTO {
  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  startValue: number

  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  endValue: number
}

class DistanceFilterDTO {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isNear?: boolean

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  fiveToTen?: boolean

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  tenToTwenty?: boolean

  @ApiProperty({ required: false })
  @Type(() => CustomDistanceFilterDTO)
  @ValidateNested()
  @IsOptional()
  custom?: CustomDistanceFilterDTO
}

export class FeedFilterDTO extends PartialType(PostsFilterDTO) {
  @ApiProperty({ required: false })
  @Type(() => DistanceFilterDTO)
  @ValidateNested()
  @IsOptional()
  distance?: DistanceFilterDTO
}
