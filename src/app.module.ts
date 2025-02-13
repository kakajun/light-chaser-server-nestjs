import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ArticleModule } from './module/article/article.module'
import envConfig from '../config/env'
import { AuthModule } from './module/system/auth/auth.module'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './common/guards/jwt-auth.grard'
import { FileModule } from './module/file/file.module'
import { LoggerService } from './module/monitor/logger/logger.service'
import { ProjectModule } from './module/project/project.module'
import { UserModule } from './module/user/user.module'
import { AxiosModule } from './module/axios/axios.module'
import { DataSourceModule } from './module/dataSource/dataSource.module'
import { RoleModule } from './module/role/role.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局
      envFilePath: [envConfig.path],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'sqlite', // 修改为 sqlite
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        database: configService.get('DB_NAME'), // 数据库文件名，SQLite 使用文件路径
        extra: {
          journalMode: 'WAL',
          foreignKeys: true, // 启用外键支持
        },
        synchronize: true, // 根据实体自动创建数据库表， 生产环境建议关闭
        logging: true, // 添加此行以启用 SQL 日志
      }),
    }),
    ArticleModule,
    AuthModule,
    FileModule,
    UserModule,
    ProjectModule,
    // DataSourceModule,
    AxiosModule,
    DataSourceModule,
    RoleModule,
  ],
  controllers: [AppController],
  // 注册为全局守卫
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    LoggerService,
  ],
  exports: [LoggerService], // 导出 LoggerService
})
export class AppModule {}
