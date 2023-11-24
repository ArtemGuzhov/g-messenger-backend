import { IPaginationMeta } from 'nestjs-typeorm-paginate'

export class ListResponse<T> {
  items: T[]
  meta: IPaginationMeta
}
