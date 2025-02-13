import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiBody, ApiTags } from '@nestjs/swagger'
import { DataSourceService } from './dataSource.service'
import { DataSourceEntity } from './entities/dataSource.entity'
import { ListDataSourcetDto, CreateDataSourceDto } from './dto/dataSource.dto'
import { ResultData } from '@/common/utils/result'

@ApiTags('配置数据')
@Controller('api/datasource')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @ApiOperation({ summary: '通过ID获取指定数据源' })
  @ApiBearerAuth()
  @Get('get/:id')
  async getDataSource(@Param('id') id: number) {
    const datasource = await this.dataSourceService.getDataSource(id)
    return ResultData.ok(datasource)
  }

  @ApiOperation({ summary: '页面列表' })
  @ApiBearerAuth()
  @Get('list')
  async getDataSourceList() {
    const datasources = await this.dataSourceService.getDataSourceList()
    return ResultData.ok(datasources)
  }

  @ApiOperation({ summary: '分页页面列表' })
  @ApiBearerAuth()
  @Post('pageList')
  @ApiBody({ type: ListDataSourcetDto, description: '根据项目名称搜索所有' })
  async getDataSourcePageList(@Body() pageParam: ListDataSourcetDto) {
    const datasources = await this.dataSourceService.getDataSourcePageList(pageParam)
    return ResultData.ok(datasources)
  }

  @ApiOperation({ summary: '创建数据源' })
  @ApiBearerAuth()
  @Post('add')
  async addDataSource(@Body() datasource: CreateDataSourceDto) {
    const id = await this.dataSourceService.addDataSource(datasource)
    return ResultData.ok(id)
  }

  @ApiOperation({ summary: '更新数据源' })
  @ApiBearerAuth()
  @Post('update')
  async updateDataSource(@Body() datasource: DataSourceEntity) {
    const result = await this.dataSourceService.updateDataSource(datasource)
    return result ? ResultData.ok() : ResultData.fail(500, '更新失败')
  }

  @ApiOperation({ summary: '复制数据源' })
  @ApiBearerAuth()
  @Get('copy/:id')
  async copyDataSource(@Param('id') id: number) {
    const result = await this.dataSourceService.copyDataSource(id)
    return ResultData.ok(result)
  }

  @ApiOperation({ summary: '删除数据源' })
  @ApiBearerAuth()
  @Post('batchDel')
  async delDataSource(@Body() ids: number[]) {
    const result = await this.dataSourceService.delDataSource(ids)
    return result ? ResultData.ok() : ResultData.fail(500, '删除失败')
  }

  @ApiOperation({ summary: '测试数据源' })
  @ApiBearerAuth()
  @Get('test/:id')
  async testDataSourceConnect(@Param('id') id: number) {
    const result = await this.dataSourceService.testDataSourceConnect(id)
    return result ? ResultData.ok(id, '链接正常') : ResultData.fail(500, '链接失败')
  }
}
