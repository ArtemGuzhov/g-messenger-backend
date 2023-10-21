import { PaginationInput } from '../graphql/inputs/pagination.input'

export const getTakeAndSkip = ({
  page,
  limit,
}: PaginationInput): {
  skip: number
  take: number
} => {
  if (page === 1) {
    return { take: limit, skip: 0 }
  }

  return {
    take: limit,
    skip: (page - 1) * limit,
  }
}
