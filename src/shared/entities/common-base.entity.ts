import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export class CommonBaseEntity {
  /**
   * Первичный ключ
   */
  @PrimaryGeneratedColumn('uuid')
  id: string

  /**
   * Дата создания записи
   */
  @CreateDateColumn()
  createdAt: Date

  /**
   * Дата последнего обновления записи
   */
  @UpdateDateColumn()
  updatedAt: Date

  /**
   * Дата удаления записи
   */
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null
}
