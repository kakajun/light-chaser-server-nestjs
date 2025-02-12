import { HttpException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DataSourceEntity } from './entities/dataSource.entity'
import { CreateDataSourceDto } from './dto/dataSource.dto'
import { PageParam } from './dataSource.controller'

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

  async delDataSource(id: number): Promise<boolean> {
    if (!id) return false
    const result = await this.datasourceRepository.delete(id)
    return result.affected > 0
  }

  async getDataSourcePageList(pageParam: PageParam): Promise<DataSourceEntity[]> {
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

    const [data, total] = await queryBuilder.getManyAndCount()
    return data
  }
}
