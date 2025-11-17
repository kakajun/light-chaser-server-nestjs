import { HttpException, Controller, Post, Param, UseInterceptors, Get, Body, UploadedFile } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiTags, ApiParam, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileService } from './file.service'
import * as multer from 'multer'

@Controller('api/file')
@ApiTags('文件管理')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiBearerAuth()
  @Post('/upload')
  @ApiOperation({
    summary: '上传image/jpeg, image/png文件',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        projectId: {
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
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (allowed.includes(file.mimetype)) cb(null, true)
        else cb(new Error('不支持的文件类型'), false)
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Body('projectId') projectId: number) {
    if (!file) {
      throw new HttpException('No file uploaded', 500)
    }
    try {
      const result = await this.fileService.uploadImage(file, projectId)
      return result
    } catch (error) {
      throw new HttpException(error.message, 500)
    }
  }

  @ApiBearerAuth()
  @Get('getList/:id')
  @ApiOperation({ summary: '通过ID获取上传文件' })
  @ApiResponse({
    status: 200,
    type: [String],
  })
  async getSourceImageList(@Param('id') id: number) {
    return this.fileService.getSourceImageList(id)
  }

  @ApiBearerAuth()
  @Get('del/:id')
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  async delImageSource(@Param('id') id: number) {
    return await this.fileService.delImageSource(id)
  }
}
