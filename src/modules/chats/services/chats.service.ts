import { Injectable } from '@nestjs/common'
import { EntityManager, Repository } from 'typeorm'
import { ChatEntity } from '../entities/chat.entity'
import { InjectEntityManager } from '@nestjs/typeorm'

@Injectable()
export class ChatsService {
  private readonly repository: Repository<ChatEntity>
  private readonly alias = 'chats'

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    this.repository = this.entityManager.getRepository(ChatEntity)
  }

  async getChatsByUserId(userId: string): Promise<ChatEntity[]> {
    return this.repository
      .createQueryBuilder(this.alias)
      .leftJoinAndSelect(`${this.alias}.messages`, 'messages')
      .leftJoin(`${this.alias}.users`, 'users')
      .where('users.id = :userId', { userId })
      .getMany()
  }
}
