import { Controller, Post, UseInterceptors, Get, UploadedFiles, BadRequestException } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiTags, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { FilesInterceptor } from '@nestjs/platform-express'
import { UploadService } from './upload.service'
import * as multer from 'multer'
@Controller('upload')
@ApiTags('Upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiBearerAuth()
  @Post('/files')
  @ApiOperation({
    summary: '上传image/jpeg, image/png, application/pdf文件',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', undefined, {
      storage: multer.memoryStorage(), // 使用内存存储，不立即保存到文件系统
    }),
  )
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded')
    }

    const uploadResults = []

    for (const file of files) {
      try {
        const result = await this.uploadService.uploadFile(file)
        uploadResults.push(result)
      } catch (error) {
        throw new BadRequestException(error.message)
      }
    }

    return uploadResults
  }

  @ApiBearerAuth()
  @Get('/files')
  @ApiOperation({ summary: '获取所有上传文件' })
  @ApiResponse({
    status: 200,
    description: 'List of uploaded files',
    type: [String],
  })
  async getAllUploadedFiles() {
    return this.uploadService.getAllUploadedFiles()
  }
}
