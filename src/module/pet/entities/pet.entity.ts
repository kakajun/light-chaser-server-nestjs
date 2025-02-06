import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('pet')
export class PetEntity {
  @PrimaryGeneratedColumn()
  id: number // 标记为主列，值自动生成

  @Column({ length: 20 })
  name: string

  @Column({ length: 20 })
  birthday: string // 添加生日字段

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date
}
