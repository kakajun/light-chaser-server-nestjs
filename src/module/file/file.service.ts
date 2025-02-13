import { Injectable, HttpException, BadRequestException, Logger } from '@nestjs/common'
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
  private readonly logger = new Logger(FileService.name)

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly configService: ConfigService,
  ) {
    this.projectResourcePath = this.configService.get('PROJECT_RESOURCE_PATH')
    this.sourceImagePath = this.configService.get('SOURCE_IMAGE_PATH')
  }
  async uploadImage(file: Express.Multer.File, projectId: number) {
    // 校验基础参数
    if (!projectId || !file) throw new BadRequestException('图片文件参数错误')

    // 验证文件大小 (可选)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      this.logger.error(`图片大小不能超过5M: ${file.size}`)
      throw new BadRequestException('F图片大小不能超过5M!')
    }
    const fileName = file.originalname
    const suffix = path.extname(fileName)
    if (!ImageType.includes(suffix)) throw new BadRequestException('图片格式不支持')
    // 校验文件 hash
    let hash: string
    try {
      const buffer = file.buffer
      hash = createHash('md5').update(buffer).digest('hex')
    } catch (e) {
      throw new BadRequestException('图片 hash 校验失败')
    }

    const record = await this.fileRepository.findOne({
      where: {
        projectId,
        hash,
        deleted: '0',
      },
    })

    // 如果已经存在相同 hash 值的图片文件，则直接返回已存在的图片地址
    if (record) return ResultData.ok(path.posix.join(this.sourceImagePath, record.url))
    // 生成文件路径、文件名
    const newFileName = GenerateUUID() + suffix
    const uploadDir = this.projectResourcePath + this.sourceImagePath
    const destPath = `${uploadDir}/${newFileName}`
    // 检查目标路径是否存在，如果不存在则创建
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    // 保存文件
    try {
      fs.writeFileSync(destPath, file.buffer)
    } catch (e) {
      throw new HttpException('图片写入文件系统失败', 500)
    }
    // 数据入库
    const newFileEntity = this.fileRepository.create({
      name: file.originalname,
      url: newFileName,
      hash,
      projectId,
    })
    await this.fileRepository.save(newFileEntity)
    return ResultData.ok(path.posix.join(this.sourceImagePath, newFileName))
  }

  async getSourceImageList(projectId: number) {
    if (!projectId) throw new BadRequestException('项目 id 错误')
    const images = await this.fileRepository.find({
      where: {
        projectId,
        deleted: '0',
      },
    })
    images.forEach((image) => {
      image.url = this.sourceImagePath + image.url
    })
    return ResultData.ok(images)
  }

  async delImageSource(imageId: number) {
    if (!imageId || imageId <= 0) throw new BadRequestException('图片 id 错误')
    const result = await this.fileRepository.delete(imageId)
    return result.affected > 0 ? ResultData.ok() : ResultData.fail(500, '删除失败')
  }
}
