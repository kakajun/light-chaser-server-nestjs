import { HttpException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ArticleEntity } from './entities/article.entity'
import { ResultData } from '@/common/utils/result'
import { ListArticleData } from './dto/article.dto'

// import { LoggerService } from '@/module/monitor/logger/logger.service'
import { UserEntity } from '@/module/user/entities/user.entity'
import { plainToInstance } from 'class-transformer'

export interface ArticleRo {
  list: ArticleEntity[]
  total: number
}
@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    // private readonly logger: LoggerService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  // 创建文章
  async create(post: Partial<ArticleEntity>) {
    const { title } = post
    if (!title) {
      throw new HttpException('缺少文章标题', 401)
    }
    const doc = await this.articleRepository.findOne({ where: { title } })
    if (doc) {
      throw new HttpException('文章已存在', 401)
    }
    await this.articleRepository.save(post)
    return ResultData.ok()
  }

  // 获取文章列表
  async findAll(query: ListArticleData) {
    const entity = this.articleRepository.createQueryBuilder('entity')
    // entity.where('entity.delFlag = :delFlag', { delFlag: '0' })
    if (query.tittle) {
      entity.andWhere(`entity.tittle LIKE "%${query.tittle}%"`)
    }
    if (query.content) {
      entity.andWhere(`entity.content LIKE "%${query.content}%"`)
    }
    if (query.createBy) {
      entity.andWhere(`entity.create_by LIKE "%${query.createBy}%"`)
    }
    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status })
    }
    entity.skip(query.size * (query.current - 1)).take(query.size)
    const [list, total] = await entity.getManyAndCount()

    return ResultData.ok({
      list,
      total,
    })
  }

  // 获取指定文章
  async findById(id) {
    const data = await this.articleRepository.findOne({ where: { id } })
    return ResultData.ok(data)
  }

  // 更新文章
  async update(post) {
    const id = post.id
    const existPost = await this.articleRepository.findOne({ where: { id } })
    if (!existPost) {
      throw new HttpException(`id为${id}的文章不存在`, 401)
    }
    const updatePost = this.articleRepository.merge(existPost, post)
    const data = await this.articleRepository.save(updatePost)
    return ResultData.ok(data)
  }

  // 刪除文章
  async remove(id) {
    const existPost = await this.articleRepository.findOne({ where: { id } })
    if (!existPost) {
      throw new HttpException(`id为${id}的文章不存在`, 401)
    }
    await this.articleRepository.remove(existPost)
    return ResultData.ok()
  }

  /**
   * @description: 通过查用户表查文章, 把用户信息也查过来了, 代码简单但是数据量大的话速度慢
   * @param {string} userName
   */
  async findUsersWithArticles(userName: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.articles', 'article') // 使用已定义的关系字段
      .where('user.userName = :name', { name: userName })
      .getOne()
    if (!user) {
      throw new HttpException(`用户名为${userName}的作者不存在`, 401)
    }
    // 使用 plainToInstance 进行转换
    const convertedUser = plainToInstance(UserEntity, user, {
      excludeExtraneousValues: true,
    })
    return ResultData.ok(convertedUser)
  }

  /**
   * @description: 通过查用户表查文章,代码多, 但是做了分页, 不查用户信息, 速度快
   * @param {string} userName
   * @param {number} page
   * @param {number} size
   */
  async findArticlesByUserName(userName: string, page: number, size: number) {
    const [articles, total] = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.user', 'user')
      .where('user.userName = :userName', { userName })
      .skip((page - 1) * size)
      .take(size)
      .select([
        'article.id',
        'article.title',
        'article.content',
        'article.thumb_url',
        'article.create_by',
        'article.create_time',
        'article.update_by',
        'article.update_time',
        'article.remark',
      ])
      .getManyAndCount()
    return ResultData.ok({
      list: articles,
      total,
    })
  }
}
