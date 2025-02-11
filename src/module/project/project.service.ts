import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProjectEntity } from '../entity/project.entity'
import { PageParamEntity } from '../entity/page-param.entity'
import { Page } from '../entity/page.entity' // 假设你有一个Page实体类来处理分页
import { MultipartFile } from 'fastify-multer/lib/interfaces'

import { GlobalVariables } from '../global/global-variables' // 假设你有一个GlobalVariables类

import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
  ) {}

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

  async uploadCover(project: ProjectEntity): Promise<string> {
    if (!project || !project.id || !project.file) {
      throw new HttpException('参数错误', 500)
    }
    const file = project.file as MultipartFile
    if (file.size > GlobalVariables.IMAGE_SIZE) {
      throw new HttpException('图片大小不能超过5M', 500)
    }
    const fileName = file.originalname
    if (!fileName) {
      throw new HttpException('图片名称错误', 500)
    }
    const suffix = fileName.substring(fileName.lastIndexOf('.'))
    if (!GlobalVariables.IMAGE_TYPE.includes(suffix)) {
      throw new HttpException('图片格式不支持', 500)
    }
    const existingProject = await this.projectRepository.findOne({
      where: { id: project.id, deleted: 0 },
    })
    if (existingProject && existingProject.cover) {
      const oldFileName = existingProject.cover
      const oldAbsolutePath = join(GlobalVariables.PROJECT_RESOURCE_PATH, GlobalVariables.COVER_PATH, oldFileName)
      const oldFile = new File(oldAbsolutePath)
      if (oldFile.exists()) {
        const deleteResult = oldFile.delete()
        if (!deleteResult) {
          throw new HttpException('旧图片删除失败', 500)
        }
      }
    }
    const newFileName = `${uuidv4().replace(/-/g, '')}${suffix}`
    const uploadDir = join(GlobalVariables.PROJECT_RESOURCE_PATH, GlobalVariables.COVER_PATH)
    if (!fs.existsSync(uploadDir)) {
      const mkdirsResult = fs.mkdirSync(uploadDir, { recursive: true })
      if (!mkdirsResult) {
        throw new HttpException('封面目录创建失败', 500)
      }
    }
    const destFile = join(uploadDir, newFileName)
    await file.mv(destFile)
    project.cover = newFileName
    project.updateTime = new Date()
    await this.projectRepository.update(project.id, project)
    return `${GlobalVariables.COVER_PATH}${newFileName}`
  }

  async getProjectPageList(pageParam: PageParamEntity): Promise<Page<ProjectEntity>> {
    if (!pageParam) return new Page<ProjectEntity>(0, 0, [])
    const current = pageParam.current || 1
    const size = pageParam.size || 10
    const [projects, total] = await this.projectRepository.findAndCount({
      where: {
        deleted: 0,
        ...(pageParam.searchValue ? { name: Like(`%${pageParam.searchValue}%`) } : {}),
      },
      select: ['id', 'name', 'des', 'cover'],
      skip: (current - 1) * size,
      take: size,
    })
    const pageData = new Page<ProjectEntity>(current, size, projects, total)
    // 补全封面的完整路径
    for (const projectEntity of pageData.records) {
      if (projectEntity.cover) {
        projectEntity.cover = `${GlobalVariables.COVER_PATH}${projectEntity.cover}`
      }
    }
    return pageData
  }
}
