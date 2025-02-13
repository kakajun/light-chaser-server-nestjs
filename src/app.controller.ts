import { Body, Controller, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty } from '@nestjs/swagger'
import { Public } from '@/common/public.decorator'

class CreateUserWithPostDto {
  @ApiProperty({ description: '用户名', example: 'john_doe' })
  username: string

  @ApiProperty({ description: '文章标题', example: 'My First Post' })
  articleTitle: string
}

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
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
}
