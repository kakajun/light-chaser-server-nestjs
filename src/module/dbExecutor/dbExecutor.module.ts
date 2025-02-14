import { Module } from '@nestjs/common'
import { DbExecutorService } from './dbExecutor.service'
import { DbExecutorController } from './dbExecutor.controller'
import { DataSourceModule } from '@/module/dataSource/dataSource.module'

@Module({
  imports: [DataSourceModule],
  controllers: [DbExecutorController],
  providers: [DbExecutorService],
})
export class DbExecutorModule {}
