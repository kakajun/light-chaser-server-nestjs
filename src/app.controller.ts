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

  @ApiBearerAuth()
  @ApiOperation({ summary: '通过事务建立用户和默认文章' })
  @ApiBody({ type: CreateUserWithPostDto })
  @Post('create-user-with-post')
  async createUserWithPost(@Body() createUserWithPostDto: CreateUserWithPostDto): Promise<void> {
    const { username, articleTitle } = createUserWithPostDto
    await this.appService.createUserWithPost(username, articleTitle)
  }
}
