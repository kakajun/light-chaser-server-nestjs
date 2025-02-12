import { Module } from '@nestjs/common'
import { DataSourceService } from './dataSource.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSourceController } from './dataSource.controller'
import { DataSourceEntity } from './entities/dataSource.entity'

@Module({
  imports: [TypeOrmModule.forFeature([DataSourceEntity])],
  controllers: [DataSourceController],
  providers: [DataSourceService],
})
export class DataSourceModule {}
