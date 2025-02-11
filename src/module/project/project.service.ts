import { Injectable, HttpException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProjectEntity } from './entities/project.entity'
import { PageParam } from './project.controller'
import { ResultData } from '@/common/utils/result'
import { IMAGE_SIZE, ImageType } from '@/common/constant/index' // 假设你有一个GlobalVariables类
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

  async updateProject(project: ProjectEntity): Promise<boolean> {
    if (!project || !project.id) return false
    project.updateTime = new Date()
    const result = await this.projectRepository.update(project.id, project)
    return result.affected > 0
  }

  async getProjectData(id: number): Promise<string> {
    if (!id) return null
    const project = await this.projectRepository.findOne({
      where: { id },
      select: ['dataJson'],
    })
    return project ? project.dataJson : null
  }

  async createProject(project: ProjectEntity): Promise<number> {
    if (!project) return null
    const savedProject = await this.projectRepository.save(project)
    return savedProject.id
  }

  async deleteProject(id: number): Promise<boolean> {
    if (!id) return false
    const result = await this.projectRepository.delete(id)
    return result.affected > 0
  }

  async copyProject(id: number): Promise<number> {
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
    return savedProject.id
  }

  async getProjectInfo(id: number): Promise<ProjectEntity> {
    if (!id) return null
    return await this.projectRepository.findOne({ where: { id } })
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
    const [list, total] = await entity.getManyAndCount()
    // 补全封面的完整路径
    for (const projectEntity of list) {
      if (projectEntity.cover) {
        projectEntity.cover = `${this.coverPath}${projectEntity.cover}`;
      }
    }

    return ResultData.ok({
      list,
      total,
    })
  }
}
