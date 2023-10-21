export interface IPagination {
  itemsCount: number
  totalItems: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

export class ListResponse<T> {
  items: T[]
  pagination: IPagination
}
