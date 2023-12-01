import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DeepPartial, EntityManager, In, Repository, SelectQueryBuilder } from 'typeorm'

import { environment } from '../../../shared/environment'
import { SimpleUser } from '../../../shared/interfaces/simple-user.interface'
import { CompaniesEntity } from '../../companies/entities/companies.entity'
import { CryptoService } from '../../crypto/services/crypto.service'
import { UsersEntity } from '../entities/users.entity'

@Injectable()
export class UsersService implements OnModuleInit {
  protected alias = 'users'
  private readonly companiesRepository: Repository<CompaniesEntity>
  private readonly repository: Repository<UsersEntity>

  constructor(
    @InjectEntityManager() protected readonly entityManager: EntityManager,
    private readonly cryptoService: CryptoService,
  ) {
    this.companiesRepository = this.entityManager.getRepository(CompaniesEntity)
    this.repository = this.entityManager.getRepository(UsersEntity)
  }

  async onModuleInit(): Promise<void> {
    const company = this.companiesRepository.create({
      id: '357c7d63-0856-49a0-9608-1b1ba80ff5c5',
      name: 'Qtim',
    })
    await this.companiesRepository.save(company)
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

  async create(payload: DeepPartial<UsersEntity>): Promise<UsersEntity> {
    const password = this.cryptoService.getPasswordHash(
      'Qwerty123',
      environment.crypto.salt,
    )

    const company = await this.companiesRepository.findOneOrFail({
      where: {
        id: '357c7d63-0856-49a0-9608-1b1ba80ff5c5',
      },
    })

    const user = this.repository.create({
      ...payload,
      company,
      password,
    })

    return this.repository.save(user)
  }

  async getSimpleUser(id: string): Promise<SimpleUser> {
    const user = await this.repository.findOne({
      select: ['id', 'avatar', 'name', 'label'],
      where: {
        id,
      },
    })

    if (user === null) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async getSimpleUsers(ids: string[]): Promise<SimpleUser[]> {
    if (!ids.length) {
      return []
    }

    const users = await this.repository.find({
      select: ['id', 'avatar', 'name', 'label'],
      where: {
        id: In(ids),
      },
    })

    return users
  }

  async addOrRemoveFavoriteChat(id: string, chatId: string): Promise<void> {
    const user = await this.repository.findOne({
      where: {
        id,
      },
      select: {
        favoriteChatIds: true,
      },
    })

    if (user === null) {
      throw new NotFoundException('User not found')
    }

    const isExistChatId = user.favoriteChatIds.find((id) => id === chatId)

    if (isExistChatId) {
      await this.repository.save({
        id,
        favoriteChatIds: user.favoriteChatIds.filter((id) => id !== chatId),
      })
      return
    }

    if (user.favoriteChatIds.length === 5) {
      throw new BadRequestException('Max favorite chats')
    }

    await this.repository.save({
      id,
      favoriteChatIds: [...user.favoriteChatIds, chatId],
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

  // async getUsersForCreateChat(
  //   userId: string,
  //   companyId: string,
  //   payload: PaginationQueryDTO,
  // ): Promise<ListResponse<UsersEntity>> {
  //   const query = this.repository
  //     .createQueryBuilder(this.alias)
  //     .select([`${this.alias}.id`, `${this.alias}.name`, `${this.alias}.avatar`])
  //     .where(`${this.alias}.id != :userId`, { userId })
  //     .andWhere(`${this.alias}.companyId = :companyId`, {
  //       companyId,
  //     })

  //   const { page, limit } = getPageAndLimit(payload.page, payload.limit)

  //   return this.find(query, { page, limit })
  // }

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
