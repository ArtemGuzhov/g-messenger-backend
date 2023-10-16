import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/services/prisma.service'
import { User } from '@prisma/client'

@Injectable()
export class UsersService {
  constructor(private readonly db: PrismaService) {}

  async getById(id: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: {
        id,
      },
    })
  }
}
