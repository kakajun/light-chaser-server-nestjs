import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { BaseEntity } from '@/common/entities/base'

@Entity('file')
export class FileEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  url: string

  @Column()
  name: string

  @Column()
  project_id: string
}
