import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { DataBaseEnum } from '@/common/constant/dataBaseEnum';

@Entity('datasource')
export class DatasourceEntity {
    /**
     * id
     */
    @PrimaryGeneratedColumn('increment')
    id: number;

    /**
     * 数据源链接名称
     */
    @Column()
    name: string;

    /**
     * 数据源类型
     */
    @Column({
        type: 'enum',
        enum: DataBaseEnum,
    })
    type: DataBaseEnum;

    /**
     * 用户名
     */
    @Column()
    username: string;

    /**
     * 数据源链接密码
     */
    @Column()
    password: string;

    /**
     * 数据源链接地址
     */
    @Column()
    url: string;

    /**
     * 数据源链接描述
     */
    @Column({ nullable: true })
    des: string;

    /**
     * 创建时间
     */
    @CreateDateColumn()
    createTime: Date;

    /**
     * 更新时间
     */
    @UpdateDateColumn()
    updateTime: Date;

    /**
     * 逻辑删除
     */
    @DeleteDateColumn()
    deletedAt: Date;
}
