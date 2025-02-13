import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { BaseEntity } from '@/common/entities/base'

@Entity('project')
export class ProjectEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: '项目ID' })
  id: number

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string

  @Column({ nullable: true })
  des: string

  @Column({ type: 'text', nullable: true })
  dataJson: string

  @Column({ nullable: true })
  cover: string
}
