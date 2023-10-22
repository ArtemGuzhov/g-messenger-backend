import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager, FindOneOptions, Repository } from 'typeorm'
import { UserEntity } from '../entities/user.entity'
import { InjectEntityManager } from '@nestjs/typeorm'
import { CreateUserInput } from '../graphql/inputs/create-user.input'
import { EmailInput } from 'src/shared/graphql/inputs/email.input'
import { createHash } from 'crypto'
import { SingInInput } from 'src/modules/auth/graphql/inputs/sign-in.input'
import { GetUserInput } from '../graphql/inputs/get-user.input'
import { UserError } from '../enums/user-error.enum'

@Injectable()
export class UsersService {
  private readonly repository: Repository<UserEntity>

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    this.repository = this.entityManager.getRepository(UserEntity)
  }

  async getUser(payload: GetUserInput): Promise<UserEntity> {
    const { id, email } = payload

    if (!id && !email) {
      throw new BadRequestException(UserError.NOT_FOUND_FIND_OPTIONS)
    }

    const findOptions: FindOneOptions<UserEntity> = {
      where: {},
    }

    if (id) {
      findOptions.where = { id }
    }

    if (email) {
      findOptions.where = { ...findOptions.where, email }
    }

    const user = await this.repository.findOne(findOptions)

    if (user === null) {
      throw new NotFoundException(UserError.USER_NOT_FOUD)
    }

    return user
  }

  async create(payload: CreateUserInput): Promise<UserEntity> {
    const isUserExist = await this.checkEmailExist(payload)

    if (isUserExist) {
      throw new BadRequestException(UserError.USER_ALREADY_EXIST)
    }

    // TODO: add generate random password and send this to user email
    const basePass = this.getHashPass('qwerty123')

    const newUser = this.repository.create({
      password: basePass,
      ...payload,
    })

    return this.repository.save(newUser)
  }

  async checkPassForUser(payload: SingInInput): Promise<UserEntity> {
    const user = await this.getUser(payload)
    const hashPass = this.getHashPass(payload.password)

    if (user.password !== hashPass) {
      throw UserError.INCORRECT_PASSWORD
    }

    return user
  }

  async checkEmailExist(payload: EmailInput): Promise<boolean> {
    return !!(await this.repository.findOne({
      where: {
        email: payload.email,
      },
      select: {
        id: true,
      },
    }))
  }

  private getHashPass(pass: string): string {
    return createHash('sha256').update(pass).digest('hex')
  }
}
