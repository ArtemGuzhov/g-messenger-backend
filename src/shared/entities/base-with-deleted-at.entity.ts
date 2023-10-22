import { DeleteDateColumn } from 'typeorm'
import { BaseEntity } from './base.entity'
import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export abstract class BaseWithDeletedAtEntity extends BaseEntity {
  @Field(() => String, { nullable: true })
  @DeleteDateColumn({ type: Date, nullable: true })
  deletedAt: Date | null
}
