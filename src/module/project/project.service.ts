import { Injectable, HttpException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProjectEntity } from './entities/project.entity'
import { CreateProjectDto } from './dto/project.dto'
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
    return ResultData.ok(project.dataJson)
  }

  async createProject(project: CreateProjectDto) {
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
    const project = await this.projectRepository.findOne({ where: { id } })
    if (project && project.cover) {
      const coverPath = join(this.projectResourcePath, this.coverPath, project.cover)
      if (fs.existsSync(coverPath)) {
        try {
          await fs.promises.unlink(coverPath)
        } catch (error) {
          throw new HttpException('删除项目封面失败', 500)
        }
      }
    }
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
  async uploadCover(file: Express.Multer.File, id: number) {
    if (!id || !file) {
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
      where: { id, deleted: '0' },
    })
    let oldFileName = ''
    if (existingProject && existingProject.cover) {
      oldFileName = existingProject.cover

      const oldAbsolutePath = join(this.projectResourcePath, this.coverPath, oldFileName)
      if (fs.existsSync(oldAbsolutePath)) {
        try {
          await fs.promises.unlink(oldAbsolutePath)
        } catch (error) {
          throw new HttpException('旧图片删除失败', 500)
        }
      }
    }
    const newFileName = `${GenerateUUID()}${suffix}`
    const uploadDir = join(this.projectResourcePath, this.coverPath)
    try {
      if (!fs.existsSync(uploadDir)) {
        await fs.promises.mkdir(uploadDir, { recursive: true })
      }
      const destFile = join(uploadDir, newFileName)
      await fs.promises.writeFile(destFile, file.buffer)

      if (existingProject) {
        existingProject.cover = newFileName
        existingProject.updateTime = new Date()
        await this.projectRepository.update(id, existingProject)
      }

      return ResultData.ok({
        url: `${this.coverPath}${newFileName}`,
      })
    } catch (error) {
      throw new HttpException('封面上传失败', 500)
    }
  }
  async getProjectPageList(pageParam: PageParam) {
    const entity = this.projectRepository
      .createQueryBuilder('entity')
      .where('entity.deleted = :deleted', { deleted: '0' })
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
