import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/services/prisma.service'
import { Message } from '@prisma/client'

@Injectable()
export class MessagesService {
  constructor(private readonly db: PrismaService) {}

  async getById(id: string): Promise<Message | null> {
    return this.db.message.findUnique({
      where: {
        id,
      },
    })
  }
}
