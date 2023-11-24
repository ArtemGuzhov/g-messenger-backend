import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { PaginationQueryDTO } from 'src/shared/dto/pagination-query.dto'
import { getPageAndLimit, RepositoryHelper } from 'src/shared/helpers'
import { EntityManager, In, SelectQueryBuilder } from 'typeorm'

import { ListResponse } from '../../../shared/interfaces/list-response.interface'
import { UsersEntity } from '../entities/users.entity'

@Injectable()
export class UsersService extends RepositoryHelper<UsersEntity> {
  protected alias = 'users'

  constructor(@InjectEntityManager() protected readonly entityManager: EntityManager) {
    super(entityManager.getRepository(UsersEntity))
  }

  async getUserProfile(id: string): Promise<UsersEntity> {
    const user = await this.repository.findOne({
      where: {
        id,
      },
      relations: {
        company: true,
      },
    })

    if (user === null) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async getListByIds(ids: string[]): Promise<UsersEntity[]> {
    return this.repository.find({
      where: {
        id: In(ids),
      },
    })
  }

  async updateOnline(id: string, isOnline: boolean): Promise<void> {
    if (isOnline) {
      await this.repository.save({
        id,
        isOnline,
        onlineAt: new Date().toISOString(),
      })
    }

    await this.repository.save({
      id,
      isOnline,
    })
  }

  async getUserByEmail(email: string): Promise<UsersEntity> {
    const user = await this.repository.findOne({
      where: {
        email,
      },
      relations: {
        company: true,
      },
    })

    if (user === null) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async getUserById(id: string): Promise<UsersEntity> {
    const user = await this.repository.findOne({
      where: {
        id,
      },
    })

    if (user === null) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async getUsersForCreateChat(
    userId: string,
    companyId: string,
    payload: PaginationQueryDTO,
  ): Promise<ListResponse<UsersEntity>> {
    // JSON.stringify(await get(UsersService).getUsersForCreateChat('ede2b0b1-654c-4ff6-8ebf-e7a2c7feeaee', 'd825cb83-474d-4d3d-8353-2722292f10c8', {}), null, 4)
    const query = this.repository
      .createQueryBuilder(this.alias)
      .select([`${this.alias}.id`, `${this.alias}.name`, `${this.alias}.avatar`])
      .where(`${this.alias}.id != :userId`, { userId })
      .andWhere(`${this.alias}.companyId = :companyId`, {
        companyId,
      })

    const { page, limit } = getPageAndLimit(payload.page, payload.limit)

    return this.find(query, { page, limit })
  }

  async getUserTeam(userId: string, companyId: string): Promise<UsersEntity[]> {
    return this.repository
      .createQueryBuilder(this.alias)
      .where(`${this.alias}.id != :userId`, { userId })
      .andWhere(`${this.alias}.companyId = :companyId`, {
        companyId,
      })
      .getMany()
  }

  protected joinLinks(
    queryBuilder: SelectQueryBuilder<UsersEntity>,
  ): SelectQueryBuilder<UsersEntity> {
    return queryBuilder
  }
}
