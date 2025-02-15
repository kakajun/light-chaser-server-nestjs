import { Entity, Column, PrimaryGeneratedColumn, Index, Unique } from 'typeorm'
import { BaseEntity } from '@/common/entities/base'
import { Exclude, Expose } from 'class-transformer'

@Entity('sys_user', {
  comment: '用户信息表',
})
// @Unique(['userName']) // 确保 user_name 字段唯一, 这里如果用主键做外键就可以不加这个,否则会报错
export class UserEntity extends BaseEntity {
  @Expose()
  @PrimaryGeneratedColumn({ type: 'int', name: 'user_id', comment: '用户ID' })
  public userId: number

  @Expose()
  @Index()
  @Column({
    type: 'varchar',
    name: 'user_name',
    //  unique: true,
    length: 30,
    nullable: false,
    comment: '用户账号',
  })
  public userName: string

  // @Expose()
  // @Column({ type: 'enum', enum: ['male', 'female'], nullable: true })
  // sex: 'male' | 'female' | null
  @Expose()
  //0男 1女 2未知
  @Column({ type: 'text', name: 'sex', comment: '性别' })
  public sex: string
  @Exclude({ toPlainOnly: true })
  
  @Column({ type: 'varchar', length: 200, nullable: false, default: '', comment: '用户登录密码' })
  public password: string

  @Column({ type: 'varchar', name: 'login_ip', length: 128, default: '', comment: '最后登录IP' })
  public loginIp: string

  @Column({ type: 'datetime', name: 'login_date', comment: '最后登录时间' })
  public loginDate: Date
}
