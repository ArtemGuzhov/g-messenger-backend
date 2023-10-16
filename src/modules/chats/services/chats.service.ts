import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/services/prisma.service'
import { Chat } from '@prisma/client'

@Injectable()
export class ChatsService {
  constructor(private readonly db: PrismaService) {}

  async getById(id: string): Promise<Chat | null> {
    return this.db.chat.findUnique({
      where: {
        id,
      },
    })
  }
}
