import { Controller, Get } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { AppService } from './app.service'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
// import { Public } from '@/common/public.decorator'

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService, @InjectDataSource() private readonly dataSource: DataSource) {}

  // @Public()
  @ApiOperation({ summary: '这个是自动化测试脚本不用登录测试用' })
  @Get('')
  getHi(): string {
    return this.appService.getHi()
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '这个是登陆授权测试用' })
  @Get('say-hello')
  getHello() {
    return this.appService.getHello()
  }

  @Get('health')
  async health() {
    try {
      const qr = this.dataSource.createQueryRunner()
      await qr.connect()
      await qr.query('SELECT 1')
      await qr.release()
      return { code: 200, msg: 'success', data: { status: 'up' } }
    } catch (e) {
      return { code: 500, msg: 'fail', data: { status: 'down', message: e.message } }
    }
  }
}