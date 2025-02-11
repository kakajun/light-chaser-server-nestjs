      import { Inject, Injectable } from '@nestjs/common';
      import { DataSource, Repository } from 'typeorm';
      import { InjectRepository } from '@nestjs/typeorm'
      import { DatasourceEntity } from '@/module/dataSource/entities/datasource.entity';
      import { DbExecutorEntity } from './entities/dbExecutor.entity';
      import { Base64Util } from '@/common/utils/base64Util';
      import { HttpException, Logger } from '@nestjs/common';

      @Injectable()
      export class DbExecutorService {
        private readonly logger = new Logger(DbExecutorService.name);

        constructor(
          @InjectRepository(DatasourceEntity)
          private readonly datasourceRepository: Repository<DatasourceEntity>,
          @Inject('DATA_SOURCE') // 假设你在模块中将 DataSource 注入为 'DATA_SOURCE'
          private readonly dataSource: DataSource,
        ) {}

        async executeSql(dbExecutorEntity: DbExecutorEntity): Promise<any> {
          if (!dbExecutorEntity) {
            throw new HttpException('SQL execution is incorrect, check the SQL syntax', 500);
          }

          const sql = Base64Util.decode(dbExecutorEntity.sql);
          if (!sql.trim().toLowerCase().startsWith('select')) {
            throw new HttpException('SQL cannot be empty and must start with select', 500);
          }

          const dataSourceEntity = await this.datasourceRepository.findOne({ where: { id: dbExecutorEntity.id } });
          if (!dataSourceEntity) {
            throw new HttpException('The data source does not exist', 500);
          }

          try {
            // 使用 createQueryBuilder 执行查询
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            const res = await queryRunner.query(sql);
            await queryRunner.release();

            return res.length === 1 ? res[0] : res;
          } catch (e) {
            this.logger.error(`execute sql error, please check sql syntax, sql:${sql}`, e);
            throw new HttpException(`SQL execution is incorrect, check the SQL syntax. Error: ${e.message}`, 500);
          }
        }
      }
