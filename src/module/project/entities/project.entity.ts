import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { BaseEntity } from '@/common/entities/base'

@Entity('project')
export class ProjectEntity extends BaseEntity {
  @ApiProperty({ description: '项目ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty({ description: '项目名称', example: 'Example Project' })
  @Column()
  name: string

  @ApiProperty({ description: '项目描述', example: 'This is an example project.' })
  @Column({ nullable: true })
  des: string

  @ApiProperty({ description: '逻辑删除标志', example: 0 })
  @Column({ default: 0 })
  deleted: number

  @ApiProperty({ description: '数据JSON', example: '{}' })
  @Column({ type: 'text', nullable: true })
  dataJson: string

  @ApiProperty({ description: '封面图片路径', example: '/path/to/cover.jpg' })
  @Column({ nullable: true })
  cover: string

  // 文件上传字段通常不会直接存储在数据库中
  // file: MultipartFile;
}
