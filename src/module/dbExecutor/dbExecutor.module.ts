import { Module } from '@nestjs/common'
import { DbExecutorService } from './dbExecutor.service'
import { DbExecutorController } from './dbExecutor.controller'

@Module({
  controllers: [DbExecutorController],
  providers: [DbExecutorService],
})
export class DbExecutorModule {}
