import { DeleteDateColumn } from 'typeorm'
import { BaseEntity } from './base.entity'

export abstract class BaseWithDeletedAtEntity extends BaseEntity {
  @DeleteDateColumn({ type: Date, nullable: true })
  deletedAt: Date | null
}
