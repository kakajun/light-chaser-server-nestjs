import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name)

  constructor(private readonly configService: ConfigService) {}

  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    // this.logger.log(`Received file: ${JSON.stringify(file)}`)

    if (!file) {
      this.logger.error('No file uploaded')
      throw new BadRequestException('No file uploaded')
    }

    // 验证文件类型 (可选)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedMimeTypes.includes(file.mimetype)) {
      this.logger.error(`Invalid file type: ${file.mimetype}`)
      throw new BadRequestException('Invalid file type')
    }

    // 验证文件大小 (可选)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      this.logger.error(`File is too large: ${file.size}`)
      throw new BadRequestException('File is too large!')
    }

    // 获取上传路径
    const uploadPath =
      this.configService.get('NODE_ENV') === 'production'
        ? '/www/wwwroot/blog.junfeng530.xyz/uploads'
        : path.join(__dirname, '..', '..', 'uploads')

    // 检查目标路径是否存在，如果不存在则创建
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    // 生成唯一文件名
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const fileExtension = path.extname(file.originalname)
    const fileName = `${uniqueSuffix}${fileExtension}`
    const filePath = path.join(uploadPath, fileName)

    // 保存文件到文件系统
    fs.writeFileSync(filePath, file.buffer)
    return { url: filePath }
  }

  async getAllUploadedFiles(): Promise<string[]> {
    const uploadPath =
      this.configService.get('NODE_ENV') === 'production'
        ? '/www/wwwroot/blog.junfeng530.xyz/uploads'
        : path.join(__dirname, '..', '..', 'uploads')

    if (!fs.existsSync(uploadPath)) {
      this.logger.warn(`Upload path does not exist: ${uploadPath}`)
      return []
    }

    const files = fs.readdirSync(uploadPath)
    // this.logger.log(`Found files: ${files.join(', ')}`)
    return files.map((file) => path.join(uploadPath, file))
  }
}
