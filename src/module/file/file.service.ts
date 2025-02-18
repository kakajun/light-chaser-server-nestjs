import { Injectable, HttpException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as fs from 'fs'
import * as path from 'path'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { ResultData } from '@/common/utils/result'
import { FileEntity } from './entities/file.entity'
import { ImageType } from '@/common/constant/index'
import { createHash } from 'crypto'
import { GenerateUUID } from '@/common/utils/index'

@Injectable()
export class FileService {
  private readonly projectResourcePath: string
  private readonly sourceImagePath: string
  private readonly maxFileSize = 5 * 1024 * 1024 // 5MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly configService: ConfigService,
  ) {
    this.projectResourcePath = this.configService.get('PROJECT_RESOURCE_PATH')
    this.sourceImagePath = this.configService.get('SOURCE_IMAGE_PATH')
    if (!this.projectResourcePath || !this.sourceImagePath) {
      throw new Error('必要的配置项缺失：PROJECT_RESOURCE_PATH 或 SOURCE_IMAGE_PATH')
    }
  }

  async uploadImage(file: Express.Multer.File, projectId: number) {
    try {
      // 校验基础参数
      if (!projectId || !file) {
        throw new BadRequestException('图片文件参数错误')
      }

      // 验证文件大小
      if (file.size > this.maxFileSize) {
        throw new BadRequestException('图片大小不能超过5M!')
      }

      // 验证文件类型
      const fileName = file.originalname
      const suffix = path.extname(fileName)
      if (!ImageType.includes(suffix)) {
        throw new BadRequestException('图片格式不支持')
      }

      // 验证 MIME 类型
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('不支持的文件类型')
      }

      // 校验文件 hash
      const hash = createHash('md5').update(file.buffer).digest('hex')

      // 检查文件是否已存在
      const record = await this.fileRepository.findOne({
        where: {
          projectId,
          hash,
          deleted: '0',
        },
      })

      // 如果已经存在相同 hash 值的图片文件，则直接返回已存在的图片地址
      if (record) {
        return ResultData.ok(path.posix.join(this.sourceImagePath, record.url))
      }

      // 生成文件路径、文件名
      const newFileName = GenerateUUID() + suffix
      const uploadDir = path.join(this.projectResourcePath, this.sourceImagePath)
      const destPath = path.join(uploadDir, newFileName)

      // 检查并创建目标目录
      await fs.promises.mkdir(uploadDir, { recursive: true })

      // 保存文件
      await fs.promises.writeFile(destPath, file.buffer)

      // 数据入库
      const newFileEntity = this.fileRepository.create({
        name: file.originalname,
        url: newFileName,
        hash,
        projectId,
      })
      await this.fileRepository.save(newFileEntity)

      return ResultData.ok(path.posix.join(this.sourceImagePath, newFileName))
    } catch (error) {
      throw new HttpException('上传图片失败', 500)
    }
  }

  async getSourceImageList(projectId: number) {
    try {
      if (!projectId) {
        throw new BadRequestException('项目 id 错误')
      }

      const images = await this.fileRepository.find({
        where: {
          projectId,
          deleted: '0',
        },
      })

      images.forEach((image) => {
        image.url = path.posix.join(this.sourceImagePath, image.url)
      })

      return ResultData.ok(images)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new HttpException('获取图片列表失败', 500)
    }
  }

  async delImageSource(imageId: number) {
    try {
      if (!imageId || imageId <= 0) {
        throw new BadRequestException('图片 id 错误')
      }

      // 查找图片记录
      const image = await this.fileRepository.findOne({
        where: { id: imageId, deleted: '0' }
      })

      if (!image) {
        throw new BadRequestException('图片不存在')
      }

      // 删除文件系统中的文件
      const filePath = path.join(this.projectResourcePath, this.sourceImagePath, image.url)
      try {
        await fs.promises.access(filePath)
        await fs.promises.unlink(filePath)
      } catch (error) {
        throw new HttpException(`删除文件失败: ${filePath}`, 500)
      }

      // 删除数据库记录
      const result = await this.fileRepository.delete(imageId)

      if (result.affected > 0) {
        return ResultData.ok()
      }
      throw new BadRequestException('删除失败')
    } catch (error) {
      throw new HttpException('删除图片失败', 500)
    }
  }
}
