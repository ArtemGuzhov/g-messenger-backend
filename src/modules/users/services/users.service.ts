import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/services/prisma.service'
import { Prisma, User } from '@prisma/client'

@Injectable()
export class UsersService {
  private readonly db: Prisma.UserDelegate

  constructor(private readonly prisma: PrismaService) {
    this.db = this.prisma.user
  }

  async getById(id: string): Promise<User | null> {
    return this.db.findUnique({
      where: {
        id,
      },
    })
  }
}
