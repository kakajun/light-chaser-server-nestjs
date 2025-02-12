import { Injectable, HttpException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProjectEntity } from './entities/project.entity'
import { CreatProjectDto } from './dto/project.dto'
import { PageParam } from './project.controller'
import { ResultData } from '@/common/utils/result'
import { IMAGE_SIZE, ImageType } from '@/common/constant/index'
import { ConfigService } from '@nestjs/config'
import { join } from 'path'
import { GenerateUUID } from '@/common/utils/index'
import * as fs from 'fs' // 导入fs模块

@Injectable()
export class ProjectService {
  private readonly projectResourcePath: string
  private readonly coverPath: string
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
    private readonly configService: ConfigService,
  ) {
    this.projectResourcePath = this.configService.get('PROJECT_RESOURCE_PATH')
    this.coverPath = this.configService.get('COVER_PATH')
  }

  async updateProject(project: ProjectEntity) {
    if (!project || !project.id) return false
    project.updateTime = new Date()
    const result = await this.projectRepository.update(project.id, project)
    return result.affected > 0 ? ResultData.ok() : ResultData.fail(500, '更新失败')
  }

  async getProjectData(id: number) {
    if (!id) return null
    const project = await this.projectRepository.findOne({
      where: { id },
      select: ['dataJson', 'id', 'name'],
    })
    return ResultData.ok({
      dataJson: project.dataJson,
      id: project.id,
      name: project.name,
    });
  }

  async createProject(project: CreatProjectDto) {
    if (!project) return null
    const doc = await this.projectRepository.findOne({ where: { name: project.name } })
    if (doc) {
      throw new HttpException('工程名称重复', 401)
    }
    const savedProject = await this.projectRepository.save(project)
    return ResultData.ok(savedProject.id)
  }

  async deleteProject(id: number) {
    if (!id) return false
    const result = await this.projectRepository.delete(id)
    return result.affected > 0 ? ResultData.ok() : ResultData.fail(500, '删除失败')
  }

  async copyProject(id: number) {
    if (!id) return null
    const project = await this.projectRepository.findOne({ where: { id } })
    if (!project) return null
    const newProject = {
      ...project,
      id: undefined,
      name: `${project.name} - 副本`,
      createTime: undefined,
      updateTime: undefined,
    }
    const savedProject = await this.projectRepository.save(newProject)
    return ResultData.ok(savedProject.id)
  }

  async getProjectInfo(id: number) {
    if (!id) return null
    const data = await this.projectRepository.findOne({ where: { id } })
    return ResultData.ok(data)
  }

  async uploadCover(project, file: Express.Multer.File) {
    if (!project || !project.id || !project.file) {
      throw new HttpException('参数错误', 500)
    }

    if (file.size > IMAGE_SIZE) {
      throw new HttpException('图片大小不能超过5M', 500)
    }
    const fileName = file.originalname
    if (!fileName) {
      throw new HttpException('图片名称错误', 500)
    }
    const suffix = fileName.substring(fileName.lastIndexOf('.'))
    if (!ImageType.includes(suffix)) {
      throw new HttpException('图片格式不支持', 500)
    }
    const existingProject = await this.projectRepository.findOne({
      where: { id: project.id, deleted: 0 },
    })
    if (existingProject && existingProject.cover) {
      const oldFileName = existingProject.cover

      const oldAbsolutePath = join(this.projectResourcePath, this.coverPath, oldFileName)
      if (fs.existsSync(oldAbsolutePath)) {
        try {
          await fs.promises.unlink(oldAbsolutePath) // 使用fs.promises.unlink异步删除文件
        } catch (error) {
          throw new HttpException('旧图片删除失败', 500)
        }
      }
    }
    const newFileName = `${GenerateUUID()}${suffix}`
    const uploadDir = join(this.projectResourcePath, this.coverPath)
    if (!fs.existsSync(uploadDir)) {
      const mkdirsResult = fs.mkdirSync(uploadDir, { recursive: true })
      if (!mkdirsResult) {
        throw new HttpException('封面目录创建失败', 500)
      }
    }
    const destFile = join(uploadDir, newFileName)
    // await file.mv(destFile)
    fs.writeFileSync(destFile, file.buffer)
    project.cover = newFileName
    project.updateTime = new Date()
    await this.projectRepository.update(project.id, project)
    return ResultData.ok({
      url: `${this.coverPath}${newFileName}`,
    })
  }

  async getProjectPageList(pageParam: PageParam) {
    const entity = this.projectRepository
      .createQueryBuilder('entity')
      .where('entity.deleted = :deleted', { deleted: 0 })
    if (pageParam.searchValue) {
      entity.andWhere('entity.name LIKE :searchValue', { searchValue: `%${pageParam.searchValue}%` })
    }
    entity.select(['entity.id', 'entity.name', 'entity.des', 'entity.cover'])
    entity.skip(pageParam.size * (pageParam.current - 1)).take(pageParam.size)

    const [list, total] = await entity.getManyAndCount()
    // 补全封面的完整路径
    for (const projectEntity of list) {
      if (projectEntity.cover) {
        projectEntity.cover = `${this.coverPath}${projectEntity.cover}`
      }
    }

    return ResultData.ok({
      ...pageParam,
      records: list,
      total,
    })
  }
}
