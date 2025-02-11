import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger'

import { DatasourceService } from './datasource.service'
import { DatasourceEntity } from './entities/datasource.entity'
import { ResultData } from '@/common/utils/result'

export interface PageParam {
  size: number
  current: number
  searchValue: string
}

@ApiTags('配置数据')
@Controller('api/datasource')
export class DataSourceController {
  constructor(private readonly datasourceService: DatasourceService) {}

  @Get('get/:id')
  async getDataSource(@Param('id') id: number) {
    const datasource = await this.datasourceService.getDataSource(id)
    return ResultData.ok(datasource)
  }

  @Get('list')
  async getDataSourceList() {
    const datasources = await this.datasourceService.getDataSourceList()
    return ResultData.ok(datasources)
  }

  @Post('pageList')
  async getDataSourcePageList(@Body() pageParam: PageParam) {
    const datasources = await this.datasourceService.getDataSourcePageList(pageParam)
    return ResultData.ok(datasources)
  }

  @Post('add')
  async addDataSource(@Body() datasource: DatasourceEntity) {
    const id = await this.datasourceService.addDataSource(datasource)
    return ResultData.ok(id)
  }

  @Post('update')
  async updateDataSource(@Body() datasource: DatasourceEntity) {
    const result = await this.datasourceService.updateDataSource(datasource)
    return ResultData.ok(result)
  }

  @Get('copy/:id')
  async copyDataSource(@Param('id') id: number) {
    const result = await this.datasourceService.copyDataSource(id)
    return ResultData.ok(result)
  }

  @Get('del/:id')
  async delDataSource(@Param('id') id: number) {
    const result = await this.datasourceService.delDataSource(id)
    return ResultData.ok(result)
  }
}
