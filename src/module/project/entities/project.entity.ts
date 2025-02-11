import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { BaseEntity } from '@/common/entities/base'

@Entity('project')
export class ProjectEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ nullable: true })
  des: string

  @Column({ default: 0 })
  deleted: number

  @Column({ type: 'text', nullable: true })
  dataJson: string

  @Column({ nullable: true })
  cover: string
}
