import { Module, Global } from '@nestjs/common'
import { LoggerService } from './logger.service'

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService], // 导出 LoggerService 以便在其他模块中使用
})
export class LoggerModule {}
