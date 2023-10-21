import { Field, Int } from '@nestjs/graphql'
import { IPagination } from 'src/shared/interfaces/list-response.interface'

export class PaginationType implements IPagination {
  @Field(() => Int)
  itemsCount: number

  @Field(() => Int)
  totalItems: number

  @Field(() => Int)
  itemsPerPage: number

  @Field(() => Int)
  totalPages: number

  @Field(() => Int)
  currentPage: number
}

export abstract class ListResponseType<T> {
  pagination: PaginationType
  abstract items: T[]
}
