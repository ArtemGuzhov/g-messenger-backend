import { PaginationInput } from '../graphql/inputs/pagination.input'
import { ListResponse } from '../interfaces/list-response.interface'

export const getListWithPagination = <T>(
  list: T[],
  { page, limit, count }: PaginationInput & { count: number },
): ListResponse<T> => {
  return {
    items: list,
    pagination: {
      itemsCount: list.length,
      totalItems: count,
      itemsPerPage: limit,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    },
  }
}
