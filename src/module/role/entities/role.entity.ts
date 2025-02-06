import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm'
import { Exclude } from 'class-transformer'
import { UserEntity } from '@/module/user/entities/user.entity'

// 关联role_info表
@Entity('role_info', {
  comment: '角色信息表',
})
export class Role {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: '角色ID' })
  @Exclude({ toPlainOnly: true })
  public id: number

  @Column({ type: 'varchar', name: 'role_name', length: 255, unique: true, comment: '角色名称' })
  roleName: string

  @Column({ type: 'text', name: 'role_description', comment: '角色详细描述' })
  roleDescription: string

  @Column({ type: 'tinyint', name: 'permission_value', comment: '角色权限值（1.管理员 2.会员 3.用户）' })
  permission: number

  @Column({ type: 'varchar', name: 'create_by', comment: '创建人' })
  createBy: string

  @Column({ type: 'varchar', name: 'modify_by', comment: '修改人' })
  modifyBy: string

  @Column({ type: 'datetime', name: 'create_time', comment: '创建时间' })
  public createTime: Date

  @Column({ type: 'datetime', name: 'modify_time', comment: '最后修改时间' })
  public modifyTime: Date

  @Column({ type: 'tinyint', name: 'del_flag', comment: '删除标志（0.删除 1.存在）' })
  @Exclude({ toPlainOnly: true })
  delFlag: number

  // @ManyToOne(() => UserEntity, (user) => user.roles)
  // user: UserEntity
}
