import { Controller, Post, Body } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ProjectService } from './project.service'
import { ProjectEntity } from './entities/project.entity'

@ApiTags('DB执行')
@Controller('/api/db/executor')
export class ProjectController {
  constructor(private readonly dbExecutorService: ProjectService) {}

  @ApiOperation({ summary: '执行SQL语句' })
  @ApiBearerAuth()
  @Post('execute')
  create(@Body() post: ProjectEntity) {
    return this.dbExecutorService.executeSql(post)
  }
}
