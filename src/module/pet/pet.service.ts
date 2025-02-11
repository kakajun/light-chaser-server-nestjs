import { HttpException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PetEntity } from './entities/pet.entity'
import { ResultData } from '@/common/utils/result'

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(PetEntity)
    private readonly postsRepository: Repository<PetEntity>,
  ) {}
  async create(post: Partial<PetEntity>) {
    const { name } = post
    const doc = await this.postsRepository.findOne({ where: { name } })
    if (doc) {
      throw new HttpException('小动物已存在', 401)
    }
    await this.postsRepository.save(post)
    return ResultData.ok()
  }

  async findAll(query) {
    const qb = this.postsRepository.createQueryBuilder('post')
    qb.orderBy('post.create_time', 'DESC')
    const total = await qb.getCount()
    const { current = 1, pageSize = 10, ...params } = query
    qb.limit(pageSize)
    qb.offset(pageSize * (current - 1))
    const list = await qb.getMany()
    return ResultData.ok({
      list,
      total,
    })
  }

  async findById(id: number) {
    return await this.postsRepository.findOne({ where: { id } })
  }

  async updateById(id, post) {
    const existPost = await this.postsRepository.findOne({ where: { id } })
    if (!existPost) {
      throw new HttpException(`id为${id}的小动物不存在`, 401)
    }
    const updatePost = this.postsRepository.merge(existPost, post)
    this.postsRepository.save(updatePost)
    return ResultData.ok()
  }

  async remove(id) {
    const existPost = await this.postsRepository.findOne({ where: { id } })
    if (!existPost) {
      throw new HttpException(`id为${id}的小动物不存在`, 401)
    }
    await this.postsRepository.remove(existPost)
    return ResultData.ok()
  }
}
