import { Module } from '@nestjs/common'
import { DatasourceService } from './dataSource.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSourceController } from './dataSource.controller'
import { DatasourceEntity } from './entities/dataSource.entity'

@Module({
  imports: [TypeOrmModule.forFeature([DatasourceEntity])],
  controllers: [DataSourceController],
  providers: [DatasourceService],
})
export class DataSourceModule {}
