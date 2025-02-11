import { Controller, Post, Get, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ProjectService } from './project.service'
import { ProjectEntity } from './entities/project.entity'
import { ResultData } from '@/common/utils/result'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger'

export interface PageParam {
  size: number
  current: number
  searchValue: string
  file: any
}

@ApiTags('工程页面')
@Controller('api/project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: '页面列表' })
  @ApiBearerAuth()
  @Post('pageList')
  async getProjectPageList(@Body() pageParam: PageParam) {
    const pageData = await this.projectService.getProjectPageList(pageParam)
    return ResultData.ok(pageData)
  }

  @ApiOperation({ summary: '通过ID获取指定页面数据' })
  @ApiBearerAuth()
  @Get('getProjectData/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: '唯一标识符',
    type: String,
  })
  async getProjectData(@Param('id') id: number) {
    const data = await this.projectService.getProjectData(id)
    return ResultData.ok(data)
  }

  @ApiOperation({ summary: '通过ID获取指定页面信息' })
  @ApiBearerAuth()
  @Get('getProjectInfo/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: '唯一标识符',
    type: String,
  })
  async getProjectInfo(@Param('id') id: number) {
    const project = await this.projectService.getProjectInfo(id)
    return ResultData.ok(project)
  }

  @ApiOperation({ summary: '更新页面信息' })
  @ApiBearerAuth()
  @Post('update')
  async updateProject(@Body() project: ProjectEntity) {
    const result = await this.projectService.updateProject(project)
    return ResultData.ok(result)
  }

  @ApiOperation({ summary: '创建页面' })
  @ApiBearerAuth()
  @Post('create')
  async createProject(@Body() project: ProjectEntity) {
    const id = await this.projectService.createProject(project)
    return ResultData.ok(id)
  }

  @ApiBearerAuth()
  @Get('del/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: '唯一标识符',
    type: String,
  })
  async deleteProject(@Param('id') id: number) {
    const result = await this.projectService.deleteProject(id)
    return ResultData.ok(result)
  }

  @ApiBearerAuth()
  @Get('copy/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: '唯一标识符',
    type: String,
  })
  async copyProject(@Param('id') id: number) {
    const newId = await this.projectService.copyProject(id)
    return ResultData.ok(newId)
  }

  @ApiBearerAuth()
  @Post('cover')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(@Body() project: ProjectEntity, @UploadedFile() file: Express.Multer.File) {
    const coverPath = await this.projectService.uploadCover(project, file)
    return ResultData.ok(coverPath)
  }
}
