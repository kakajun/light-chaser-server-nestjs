import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from './module/user/entities/user.entity'
import { UserService } from './module/user/user.service'
import { ArticleService } from './module/article/article.service'
import { ResultData } from '@/common/utils/result'

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly userService: UserService, // 注入 UserService
    private readonly articleService: ArticleService,
  ) {}
  getHi(): string {
    return 'Hi!'
  }

  getHello() {
    return ResultData.ok('Hello World!')
  }

  async createUserWithPost(userName: string, articleTitle: string) {
    await this.userRepo.manager.transaction(async () => {
      try {
        // 使用 UserService 创建用户
        await this.userService.signup({ userName, password: '123' })
        // 创建帖子
        const article = {
          title: articleTitle,
          content: '初始化',
          cover_url: '',
          createBy: userName,
        }
        // 使用 ArticleService 的 create 方法
        await this.articleService.create(article)
      } catch (error) {
        // 处理错误，事务会自动回滚
        console.error('Transaction failed:', error)
        throw new NotFoundException('Transaction failed: ' + error.message)
      }
    })
    return ResultData.ok('操作成功!')
  }
}
