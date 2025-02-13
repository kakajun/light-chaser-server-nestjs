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
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Body('id') id: number) {
    if (!file) {
      throw new HttpException('No file uploaded', 500)
    }
    try {
      const result = await this.fileService.uploadImage(file, id)
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
    return this.fileService.getSourceImageList()
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
