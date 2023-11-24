import { Exclude } from 'class-transformer'
import { CommonBaseEntity } from 'src/shared/entities/common-base.entity'
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'

import { FileFormat } from '../enums/file-format.enum'
import { FilesEntity } from './files.entity'

@Entity('crops')
export class FileCropsEntity extends CommonBaseEntity {
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

  @OneToOne(() => FilesEntity, (file) => file.crop, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  file: FilesEntity
}
