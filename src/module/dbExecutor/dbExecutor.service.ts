import { Inject, Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSourceEntity } from '@/module/dataSource/entities/datasource.entity'
import { DbExecutorDto } from './dto/dbExecutor.dto'
import { Base64Util } from '@/common/utils/base64Util'
import { HttpException, Logger } from '@nestjs/common'

@Injectable()
export class DbExecutorService {
  private readonly logger = new Logger(DbExecutorService.name)

  constructor(
    @InjectRepository(DataSourceEntity)
    private readonly datasourceRepository: Repository<DataSourceEntity>,
    @Inject('DATA_SOURCE') // 假设你在模块中将 DataSource 注入为 'DATA_SOURCE'
    private readonly dataSource: DataSource,
  ) {}

  async executeSql(post: DbExecutorDto): Promise<any> {
    if (!post) {
      throw new HttpException('SQL execution is incorrect, check the SQL syntax', 500)
    }

    const sql = Base64Util.decode(post.sql)
    if (!sql.trim().toLowerCase().startsWith('select')) {
      throw new HttpException('SQL cannot be empty and must start with select', 500)
    }

    const DataSourceEntity = await this.datasourceRepository.findOne({ where: { id: post.id } })
    if (!DataSourceEntity) {
      throw new HttpException('The data source does not exist', 500)
    }

    try {
      // 使用 createQueryBuilder 执行查询
      const queryRunner = this.dataSource.createQueryRunner()
      await queryRunner.connect()
      const res = await queryRunner.query(sql)
      await queryRunner.release()

      return res.length === 1 ? res[0] : res
    } catch (e) {
      this.logger.error(`execute sql error, please check sql syntax, sql:${sql}`, e)
      throw new HttpException(`SQL execution is incorrect, check the SQL syntax. Error: ${e.message}`, 500)
    }
  }
}
