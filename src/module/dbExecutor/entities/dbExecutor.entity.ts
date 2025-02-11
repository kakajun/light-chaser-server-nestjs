import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '@/common/entities/base'

@Entity('DbExecutor')
export class DbExecutorEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number // 标记为主列，值自动生成

  @Column()
  sql: string
}
