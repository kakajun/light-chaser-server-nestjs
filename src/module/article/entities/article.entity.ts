import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '@/common/entities/base'
import { UserEntity } from '@/module/user/entities/user.entity'
import { Expose } from 'class-transformer'

@Entity('article')
export class ArticleEntity extends BaseEntity {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number // 标记为主列，值自动生成

  @Column({ length: 50, comment: '文字标题' })
  title: string
  @Expose()
  @Column({
    type: 'text',
    comment: '文章内容',
  })
  content: string
  @Expose()
  @Column({ default: '' })
  thumb_url: string
  @Expose()
  @ManyToOne(() => UserEntity, (user) => user.articles)
  @JoinColumn({ name: 'create_by', referencedColumnName: 'userName' }) // 使用 create_by 字段关联 userName
  user: UserEntity
}
