import { Controller, Post, Body } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DbExecutorService } from './dbExecutor.service'
import { DbExecutorEntity } from './entities/dbExecutor.entity'

@ApiTags('DB执行')
@Controller('/api/db/executor')
export class DbExecutorController {
  constructor(private readonly dbExecutorService: DbExecutorService) {}

  @ApiOperation({ summary: '执行SQL语句' })
  @ApiBearerAuth()
  @Post('execute')
  create(@Body() post: DbExecutorEntity) {
    return this.dbExecutorService.executeSql(post)
  }
}
