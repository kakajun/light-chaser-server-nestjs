import { HttpException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { DataSourceEntity } from './entities/dataSource.entity'
import { ListDataSourcetDto, CreateDataSourceDto } from './dto/dataSource.dto'
import { LoggerService } from '@/module/monitor/logger/logger.service'

@Injectable()
export class DataSourceService {
  constructor(
    @InjectRepository(DataSourceEntity)
    private readonly datasourceRepository: Repository<DataSourceEntity>,
    private readonly logger: LoggerService,
  ) {}

  async getDataSourceList(): Promise<DataSourceEntity[]> {
    return this.datasourceRepository.find({
      select: ['id', 'name', 'username', 'type', 'url'],
    })
  }

  async addDataSource(datasource: CreateDataSourceDto): Promise<number> {
    if (!datasource) return null
    // datasource.createTime = new Date()
    const result = await this.datasourceRepository.save(datasource)
    return result.id
  }

  async updateDataSource(datasource: DataSourceEntity): Promise<boolean> {
    if (!datasource.id) return false
    datasource.updateTime = new Date()
    const result = await this.datasourceRepository.update(datasource.id, datasource)
    return result.affected > 0
  }

  async getDataSource(id: number): Promise<DataSourceEntity> {
    if (!id) return null
    return this.datasourceRepository.findOne({
      where: { id },
      select: ['id', 'name', 'username', 'password', 'type', 'url'],
    })
  }

  async copyDataSource(id: number): Promise<boolean> {
    if (!id) return false
    const datasource = await this.getDataSource(id)
    if (!datasource) return false
    datasource.id = undefined
    datasource.createTime = undefined
    datasource.updateTime = undefined
    datasource.name += '（副本）'
    const result = await this.addDataSource(datasource)
    return result > 0
  }

  async delDataSource(ids: number[]): Promise<boolean> {
    if (!ids || ids.length === 0) return false
    const result = await this.datasourceRepository.delete(ids)
    return result.affected > 0
  }

  async getDataSourcePageList(pageParam: ListDataSourcetDto) {
    if (!pageParam) return []
    const { size = 10, current = 1, searchValue } = pageParam

    const queryBuilder = this.datasourceRepository
      .createQueryBuilder('datasource')
      .select(['datasource.id', 'datasource.name', 'datasource.username', 'datasource.type', 'datasource.url'])
      .skip((current - 1) * size)
      .take(size)

    if (searchValue) {
      queryBuilder.where('datasource.name LIKE :searchValue', { searchValue: `%${searchValue}%` })
    }

    const [list, total] = await queryBuilder.getManyAndCount()
    return {
      ...pageParam,
      records: list,
      total,
    }
  }

  async testDataSourceConnect(id: number): Promise<boolean> {
    if (id == null) {
      this.logger.error('测试数据源连接失败：ID不能为空');
      return false;
    }
    const datasource = await this.datasourceRepository.findOne({ where: { id } });
    if (datasource == null) {
      this.logger.error(`测试数据源连接失败：未找到ID为${id}的数据源`);
      return false;
    }

    let connection: DataSource;
    try {
      this.logger.info(`开始测试数据源连接，数据源信息：${JSON.stringify({
        id: datasource.id,
        name: datasource.name,
        type: datasource.type,
        url: datasource.url
      })}`);

      connection = await this.createConnection(datasource);
      const queryRunner = connection.createQueryRunner();
      await queryRunner.connect();

      if (datasource.type === 'oracle') {
        await queryRunner.query('SELECT 1 FROM dual');
      } else {
        await queryRunner.query('SELECT 1');
      }
      await queryRunner.release();
      
      this.logger.info(`数据源连接测试成功，ID：${id}`);
      return true;
    } catch (exception) {
      this.logger.error(`数据源连接测试失败，ID：${id}，错误信息：${exception.message}`, exception);
      if (connection) {
        await connection.destroy();
      }
      throw new HttpException(`连接失败: ${exception.message}`, 500);
    }
  }

  private async createConnection(datasource: CreateDataSourceDto): Promise<DataSource> {
    try {
      const arrs = datasource.url.split(':');
      if (arrs.length < 2) {
        const error = '链接地址需要带端口号';
        this.logger.error(`创建数据源连接失败：${error}，URL：${datasource.url}`);
        throw new HttpException(error, 500);
      }

      this.logger.debug(`正在创建数据源连接，host: ${arrs[0]}, port: ${arrs[1]}, database: ${datasource.name}`);
      
      return new DataSource({
        type: 'mysql',
        host: arrs[0],
        port: Number(arrs[1]),
        username: datasource.username,
        password: datasource.password,
        database: datasource.name,
      }).initialize();
    } catch (error) {
      this.logger.error(`创建数据源连接失败：${error.message}`, error);
      throw error;
    }
  }
}
