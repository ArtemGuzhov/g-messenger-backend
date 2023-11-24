import { ApiProperty } from '@nestjs/swagger'

export class PaginationMetaRTO {
  @ApiProperty({ description: 'Всего элементов' })
  totalItems?: number
  @ApiProperty({ description: 'Всего страниц' })
  totalPages?: number
  @ApiProperty({ description: 'Кол-во элементов на текущей странице' })
  itemCount?: number
  @ApiProperty({ description: 'Кол-во элементов на странице (limit)' })
  itemsPerPage?: number
  @ApiProperty({ description: 'Номер текущей страницы' })
  currentPage?: number
}

export abstract class ListResponseRTO<T> {
  @ApiProperty({ type: () => PaginationMetaRTO })
  meta: PaginationMetaRTO

  abstract items: T[]
}
