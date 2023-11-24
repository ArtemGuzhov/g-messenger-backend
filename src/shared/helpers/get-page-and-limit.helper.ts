interface Pagination {
  page: number
  limit: number
}

const getPageAndLimit = (
  page?: number,
  limit?: number,
): { page: number; limit: number } => {
  const pagination: Pagination = {
    page: 1,
    limit: 15,
  }

  if (page) {
    pagination.page = Number(page)
  }

  if (limit) {
    pagination.limit = Number(limit)
  }

  return pagination
}
export default getPageAndLimit
