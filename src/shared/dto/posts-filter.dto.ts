import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

class CustomDateFilter {
  @ApiProperty()
  @IsDateString()
  startAt: Date

  @ApiProperty()
  @IsDateString()
  endAt: Date
}

class DateFilter {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isAll?: boolean

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isToday?: boolean

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isWeek?: boolean

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isMonth?: boolean

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isYear?: boolean

  @ApiProperty({ required: false })
  @Type(() => CustomDateFilter)
  @ValidateNested()
  @IsOptional()
  custom?: CustomDateFilter
}

class AuthorFilter {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isAll?: boolean

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isSubscribers?: boolean
}

class AgeFilter {
  @ApiProperty({ required: false })
  @Transform(({ value }) => +value)
  @IsInt()
  @IsOptional()
  startAge?: number

  @ApiProperty({ required: false })
  @Transform(({ value }) => +value)
  @IsInt()
  @IsOptional()
  endAge?: number
}

export class PostsFilterDTO {
  @ApiProperty({ required: false })
  @Type(() => DateFilter)
  @ValidateNested()
  @IsOptional()
  date?: DateFilter

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  languages?: string[]

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  countries?: string[]

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  tags?: string[]

  @ApiProperty({ required: false })
  @Type(() => AuthorFilter)
  @ValidateNested()
  @IsOptional()
  author?: AuthorFilter

  @ApiProperty({ required: false })
  @Type(() => AgeFilter)
  @ValidateNested()
  @IsOptional()
  age?: AgeFilter

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  text?: string
}
