import { Module } from '@nestjs/common'
import { DbExecutorService } from './dbExecutor.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DbExecutorController } from './dbExecutor.controller'
// import { DbExecutorEntity } from './entities/dbExecutor.entity'

@Module({
  // imports: [TypeOrmModule.forFeature([DbExecutorEntity])],
  controllers: [DbExecutorController],
  providers: [DbExecutorService],
})
export class DbExecutorModule {}
