/* eslint-disable @typescript-eslint/no-unused-vars */
import { paginate, Pagination } from 'nestjs-typeorm-paginate'
import {
  FindOneOptions,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
  TreeRepository,
} from 'typeorm'

abstract class RepositoryHelper<T extends ObjectLiteral> {
  protected abstract alias: string

  constructor(
    protected readonly repository: Repository<T>,
    protected readonly treeRepository?: TreeRepository<T>,
  ) {
    this.repository = repository
    this.treeRepository = treeRepository
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    const queryBuilder = this.repository
      .createQueryBuilder(this.alias)
      .setFindOptions(options)
    return this.joinLinks(queryBuilder).getOne()
  }

  async find(
    query: SelectQueryBuilder<T>,
    pagination: { page: number; limit: number },
    values?: unknown,
    common: {
      virtualColumns?: string[]
      moreDistinctSelect?: { sql: string; name: string }[]
    } = {},
  ): Promise<Pagination<T>> {
    const simpleQuery = query.clone()

    const firstReqQuery = simpleQuery.select([`${this.alias}.id`]).distinct(true)

    if (common.moreDistinctSelect) {
      for (const { sql, name } of common.moreDistinctSelect) {
        firstReqQuery.addSelect(sql, name)
      }
    }

    const result = await paginate(firstReqQuery, {
      page: pagination.page,
      limit: pagination.limit,
    })

    const entitiesIds = result.items.map((v) => v.id)

    const { entities, raw } = result.items?.length
      ? await this.joinLinks(
          query.andWhere(`${this.alias}.id IN (:...entitiesIds)`, {
            entitiesIds,
          }),
          values,
        ).getRawAndEntities()
      : { entities: [], raw: [] }

    const items = common.virtualColumns
      ? entities.map((entity) => {
          const rawItem = raw.find((item) => item[`${this.alias}_id`] === entity.id)

          if (common.virtualColumns) {
            for (const virtualColumn of common.virtualColumns) {
              const value = rawItem[virtualColumn]

              if (value !== undefined) {
                entity = { ...entity, [virtualColumn]: value }
              }
            }
          }

          return entity
        })
      : entities

    return {
      items,
      meta: result.meta,
    }
  }

  protected abstract joinLinks(
    queryBuilder: SelectQueryBuilder<T>,
    values?: unknown,
  ): SelectQueryBuilder<T>
}

export default RepositoryHelper
