import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { BaseEntity } from '@/common/entities/base'

@Entity('file')
export class FileEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: '文件ID' })
  id: number

  @Column()
  url: string

  @Column({ type: 'varchar', name: 'name', length: 255, comment: '文件名称' })
  name: string

  @Column({
    type: 'integer',
    name: 'project_id',
    comment: '关联项目id',
  })
  projectId: number

  @Column({ type: 'integer', name: 'type', default: 1, nullable: true, comment: '文件类型' })
  type?: number

  @Column({ type: 'varchar', name: 'hash', length: 255, comment: 'hash' })
  hash: string
}
