import { Module } from '@nestjs/common'
import { DbExecutorService } from './project.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DbExecutorController } from './project.controller'
import { DbExecutorEntity } from './entities/project.entity'

@Module({
  imports: [TypeOrmModule.forFeature([DbExecutorEntity])],
  controllers: [DbExecutorController],
  providers: [DbExecutorService],
})
export class DbExecutorModule {}
