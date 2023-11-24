import { ApiProperty } from '@nestjs/swagger'
import { IPaginationMeta } from 'nestjs-typeorm-paginate'

export class MetaRTO {
  @ApiProperty({
    example: {
      totalItems: 1,
      itemCount: 1,
      itemsPerPage: 15,
      totalPages: 1,
      currentPage: 1,
    },
  })
  meta: IPaginationMeta
}
