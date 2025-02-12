import { HttpException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { DataSourceEntity } from './entities/dataSource.entity'
import { ListDataSourcetDto, CreateDataSourceDto } from './dto/dataSource.dto'

@Injectable()
export class DataSourceService {
  constructor(
    @InjectRepository(DataSourceEntity)
    private readonly datasourceRepository: Repository<DataSourceEntity>,
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
      return false
    }
    const datasource = await this.datasourceRepository.findOne({ where: { id } })
    if (datasource == null) {
      return false
    }

    let connection: DataSource
    try {
      connection = await this.createConnection(datasource)
      const queryRunner = connection.createQueryRunner()
      await queryRunner.connect()

      if (datasource.type === 'oracle') {
        await queryRunner.query('SELECT 1 FROM dual')
      } else {
        await queryRunner.query('SELECT 1')
      }
      await queryRunner.release()
    } catch (exception) {
      console.error(exception.message, exception)
      if (connection) {
        await connection.destroy()
      }
      throw new HttpException(`link failed: ${exception.message}`, 500)
    }

    return true
  }

  private async createConnection(datasource: CreateDataSourceDto): Promise<DataSource> {
    const arrs = datasource.url.split(':')
    if (arrs.length == 0) {
      throw new HttpException('链接地址需要带端口号', 500)
    }
    return new DataSource({
      // type: datasource.type as 'mysql' | 'postgres' | 'oracle' | 'mssql', // 根据实际情况调整类型
      type: 'mysql',
      host: arrs[0],
      port: Number(arrs[1]),
      username: datasource.username,
      password: datasource.password,
      database: datasource.name,
    }).initialize()
  }
}
