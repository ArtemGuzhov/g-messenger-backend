import { UsersEntity } from 'src/modules/users/entities/users.entity'
import { CommonBaseEntity } from 'src/shared/entities/common-base.entity'
import { Column, Entity, OneToMany } from 'typeorm'

@Entity('companies')
export class CompaniesEntity extends CommonBaseEntity {
  @Column({ type: 'varchar' })
  name: string

  @OneToMany(() => UsersEntity, (users) => users.company)
  users: UsersEntity[]
}
