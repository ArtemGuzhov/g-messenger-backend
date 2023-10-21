import { BaseEntity, DeleteDateColumn } from 'typeorm'

export abstract class BaseWithDeletedAtEntity extends BaseEntity {
  @DeleteDateColumn({ type: Date, nullable: true })
  deletedAt: Date | null
}
