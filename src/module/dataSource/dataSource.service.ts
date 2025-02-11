import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DatasourceEntity } from './entities/datasource.entity'
import { HttpException, Injectable } from '@nestjs/common'
import {PageParam} from './dataSource.controller';

@Injectable()
export class DatasourceService {
  constructor(
    @InjectRepository(DatasourceEntity)
    private readonly datasourceRepository: Repository<DatasourceEntity>,
  ) {}

  async getDataSourceList(): Promise<DatasourceEntity[]> {
    return this.datasourceRepository.find({
      select: ['id', 'name', 'username', 'type', 'url'],
    })
  }

  async addDataSource(datasource: DatasourceEntity): Promise<number> {
    if (!datasource) return null
    datasource.createTime = new Date()
    const result = await this.datasourceRepository.save(datasource)
    return result.id
  }

  async updateDataSource(datasource: DatasourceEntity): Promise<boolean> {
    if (!datasource.id) return false
    datasource.updateTime = new Date()
    const result = await this.datasourceRepository.update(datasource.id, datasource)
    return result.affected > 0
  }

  async getDataSource(id: number): Promise<DatasourceEntity> {
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

async getDataSourcePageList(pageParam: PageParam): Promise<DatasourceEntity[]> {
  if (!pageParam) return [];
  const { size = 10, current = 1, searchValue } = pageParam;

  const queryBuilder = this.datasourceRepository.createQueryBuilder('datasource')
    .select(['datasource.id', 'datasource.name', 'datasource.username', 'datasource.type', 'datasource.url'])
    .skip((current - 1) * size)
    .take(size);

  if (searchValue) {
    queryBuilder.where('datasource.name LIKE :searchValue', { searchValue: `%${searchValue}%` });
  }

  const [data, total] = await queryBuilder.getManyAndCount();
  return data;
}
}
