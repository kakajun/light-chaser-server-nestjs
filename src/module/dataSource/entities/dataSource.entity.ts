import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm'
import { BaseEntity } from '@/common/entities/base'

@Entity('dataSource')
export class DataSourceEntity extends BaseEntity {
  /**
   * id
   */
  @PrimaryGeneratedColumn('increment')
  id: number

  /**
   * 数据源链接名称
   */
  @Column()
  name: string

  /**
   * 数据源类型
   */
  @Column()
  type: string

  /**
   * 用户名
   */
  @Column()
  username: string

  /**
   * 数据源链接密码
   */
  @Column()
  password: string

  /**
   * 数据源链接地址
   */
  @Column()
  url: string

  /**
   * 数据源链接描述
   */
  @Column({ nullable: true })
  des: string

  /**
   * 逻辑删除
   */
  @DeleteDateColumn()
  deletedAt: Date
}
