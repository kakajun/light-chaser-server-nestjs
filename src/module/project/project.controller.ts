import { HttpException, Controller, Post, Get, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ProjectService } from './project.service'
import { ProjectEntity } from './entities/project.entity'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger'
import { ListProjectDto, CreateProjectDto } from './dto/project.dto'
import * as multer from 'multer'

export interface PageParam {
  size: number
  current: number
  searchValue: string
  // file: any
}

@ApiTags('工程页面')
@Controller('api/project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: '页面列表' })
  @ApiBearerAuth()
  @Post('pageList')
  @ApiBody({ type: ListProjectDto, description: '根据项目名称搜索所有' })
  async getProjectPageList(@Body() pageParam: ListProjectDto) {
    return await this.projectService.getProjectPageList(pageParam)
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
    return await this.projectService.getProjectData(id)
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
    return await this.projectService.getProjectInfo(id)
  }

  @ApiOperation({ summary: '更新页面信息' })
  @ApiBearerAuth()
  @Post('update')
  async updateProject(@Body() project: ProjectEntity) {
    return await this.projectService.updateProject(project)
  }

  @ApiOperation({ summary: '创建页面' })
  @ApiBearerAuth()
  @Post('create')
  async createProject(@Body() project: CreateProjectDto) {
    return await this.projectService.createProject(project)
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
    return await this.projectService.deleteProject(id)
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
    return await this.projectService.copyProject(id)
  }

  @ApiBearerAuth()
  @Post('cover')
  @ApiOperation({
    summary: '上传image/jpeg, image/png文件',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(), // 使用内存存储，不立即保存到文件系统
    }),
  )
  async uploadCover(@UploadedFile() file: Express.Multer.File, @Body('id') id: number) {
    if (!file) {
      throw new HttpException('No file uploaded', 500)
    }

    try {
      const result = await this.projectService.uploadCover(file, id)
      return result
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }
}
