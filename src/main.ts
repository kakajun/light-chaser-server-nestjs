import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './core/filter/http-exception/http-exception.filter'
import { TransformInterceptor } from './core/interceptor/transform/transform.interceptor'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { LoggerService } from './module/monitor/logger/logger.service'
import { mw as requestIpMw } from 'request-ip'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.enableCors({ origin: true, credentials: true })
  app.set('trust proxy', 1)

  const config = new DocumentBuilder()
    .setTitle('light-chaser-server-nestjs')
    .setDescription('light-chaser的后端接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'light-chaser-server', // 出现在页面浏览器标签上显示的标题
  })

  // 获取真实 ip
  app.use(requestIpMw({ attributeName: 'ip' }))

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      validationError: { target: false },
    }),
  )

  // 支持静态资源
  app.useStaticAssets('public', { prefix: '/static' })

  // 注册全局 logger 拦截器
  const loggerService = app.get(LoggerService)

  // 自定义的拦截器, 用于在请求到达控制器之前
  app.useGlobalInterceptors(new TransformInterceptor(loggerService))

  // 注册全局错误的过滤器,包括日志记录
  app.useGlobalFilters(new HttpExceptionFilter(loggerService))

  await app.listen(3000)
  // 打印端口
  console.log(`http://localhost:3000/docs`)
}
bootstrap()
