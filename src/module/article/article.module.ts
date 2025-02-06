import { Module } from '@nestjs/common'
import { ArticleController } from './article.controller'
import { ArticleService } from './article.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoggerService } from '@/module/monitor/logger/logger.service'
import { ArticleEntity } from './entities/article.entity'
import { UserEntity } from '@/module/user/entities/user.entity'
import { UserModule } from '@/module/user/user.module' // 导入 UserModule

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, UserEntity]), UserModule],
  controllers: [ArticleController],
  providers: [ArticleService, LoggerService],
  exports: [ArticleService],
})
export class ArticleModule {}
