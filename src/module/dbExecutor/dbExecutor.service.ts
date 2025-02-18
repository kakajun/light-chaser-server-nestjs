import { Inject, Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSourceEntity } from '@/module/dataSource/entities/dataSource.entity'
import { DbExecutorDto } from './dto/dbExecutor.dto'
import { Base64Util } from '@/common/utils/base64Util'
import { HttpException } from '@nestjs/common'
import { LoggerService } from '@/module/monitor/logger/logger.service'

@Injectable()
export class DbExecutorService {
  constructor(
    @InjectRepository(DataSourceEntity)
    private readonly datasourceRepository: Repository<DataSourceEntity>,
    @Inject('DATA_SOURCE') // 假设你在模块中将 DataSource 注入为 'DATA_SOURCE'
    private readonly dataSource: DataSource,
    private readonly logger: LoggerService,
  ) {}

  async executeSql(post: DbExecutorDto): Promise<any> {
    let queryRunner = null;
    try {
      // 验证输入参数
      if (!post || !post.sql) {
        throw new HttpException('SQL语句不能为空', 400);
      }

      // 解码并验证SQL
      const sql = Base64Util.decode(post.sql).trim();
      if (!sql) {
        throw new HttpException('SQL语句解码后为空', 400);
      }

      // SQL注入防护：只允许SELECT语句
      const normalizedSql = sql.toLowerCase();
      if (!normalizedSql.startsWith('select')) {
        throw new HttpException('只允许执行SELECT语句', 403);
      }

      // 验证数据源
      const dataSourceEntity = await this.datasourceRepository.findOne({ where: { id: post.id } });
      if (!dataSourceEntity) {
        throw new HttpException('数据源不存在', 404);
      }

      // 记录SQL执行开始
      this.logger.info(`开始执行SQL查询: ${sql}`);
      const startTime = Date.now();

      // 执行查询
      queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      const results = await queryRunner.query(sql);

      // 记录SQL执行完成
      const executionTime = Date.now() - startTime;
      this.logger.info(`SQL查询执行完成，耗时: ${executionTime}ms`);

      // 处理结果
      return results.length === 1 ? results[0] : results;
    } catch (error) {
      // 错误日志记录
      this.logger.error('SQL执行错误', {
        error: error.message,
        stack: error.stack,
        sql: post?.sql ? Base64Util.decode(post.sql) : 'INVALID SQL'
      });

      // 错误分类处理
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`SQL执行错误: ${error.message}`, 500);
    } finally {
      // 确保资源释放
      if (queryRunner) {
        try {
          await queryRunner.release();
        } catch (releaseError) {
          this.logger.error('释放数据库连接失败', releaseError);
        }
      }
    }
  }
}
