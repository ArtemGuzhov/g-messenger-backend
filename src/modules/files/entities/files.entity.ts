import { Exclude } from 'class-transformer'
import { CommonBaseEntity } from 'src/shared/entities/common-base.entity'
import { Column, Entity, OneToOne } from 'typeorm'

import { FileFormat } from '../enums/file-format.enum'
import { FileCropsEntity } from './file-crops.entity'

@Entity('files')
export class FilesEntity extends CommonBaseEntity {
  @Column({ type: 'enum', enum: FileFormat })
  format: FileFormat

  @Column({ type: 'text' })
  @Exclude()
  path: string

  @Column({ type: 'text' })
  mimetype: string

  @Column({
    type: 'bigint',
    default: 0,
  })
  size: number

  @Column({ type: 'boolean', default: false })
  @Exclude()
  isLinked: boolean

  @OneToOne(() => FileCropsEntity, (crop) => crop.file, {
    nullable: true,
    cascade: true,
  })
  crop: FileCropsEntity | null

  @Column({ type: 'uuid', nullable: true })
  cropId: string | null
}
