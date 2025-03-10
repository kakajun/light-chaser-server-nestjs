import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import envConfig from '../config/env' // 导入 env.ts 文件
import { AuthModule } from './module/system/auth/auth.module'
import { ServeStaticModule } from '@nestjs/serve-static'
// import { APP_GUARD } from '@nestjs/core'
// import { JwtAuthGuard } from './common/guards/jwt-auth.grard'
import { FileModule } from './module/file/file.module'
import { LoggerModule } from './module/monitor/logger/logger.module'
import { ProjectModule } from './module/project/project.module'
import { UserModule } from './module/user/user.module'
import { AxiosModule } from './module/axios/axios.module'
import { DataSourceModule } from './module/dataSource/dataSource.module'
import { join } from 'path'

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(envConfig.PROJECT_RESOURCE_PATH, envConfig.SOURCE_IMAGE_PATH),
      serveRoot: envConfig.SOURCE_IMAGE_PATH,
      exclude: ['/api/(.*)'], // 排除 /api 路由
    }),
    ServeStaticModule.forRoot({
      rootPath: join(envConfig.PROJECT_RESOURCE_PATH, envConfig.COVER_PATH),
      serveRoot: envConfig.COVER_PATH,
      exclude: ['/api/(.*)'], // 排除 /api 路由
    }),
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局
      load: [() => envConfig], // 加载 env.ts 中的配置
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbType = configService.get<'mysql' | 'postgres' | 'sqlite'>('DB_TYPE') // 显式指定类型
        return {
          type: dbType,
          entities: [`${__dirname}/**/*.entity{.ts,.js}`],
          database: configService.get('DB_NAME'), // 数据库文件名，SQLite 使用文件路径
          port: configService.get<number>('DB_PORT'),
          host: configService.get('DB_HOST'), // 添加主机配置
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          synchronize: true, // 根据实体自动创建数据库表， 生产环境建议关闭
          // logging: true, // 添加此行以启用 SQL 日志
        }
      },
    }),
    LoggerModule,
    AuthModule,
    FileModule,
    UserModule,
    ProjectModule,
    AxiosModule,
    DataSourceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // TODO 暂时关闭全局守卫, 不需要token验证
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],

})
export class AppModule {}
