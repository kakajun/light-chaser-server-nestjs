import { Body, Controller, Get, ParseIntPipe, Post, Query, Request } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-users.dto'
import { Public } from '@/common/public.decorator'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { ApiBearerAuth } from '@nestjs/swagger'
import * as Useragent from 'useragent'
import { AxiosService } from '@/module/axios/axios.service'
import { LoggerService } from '@/module/monitor/logger/logger.service'

@ApiTags('用户')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly axiosService: AxiosService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * 注册
   * @param username 姓名
   * @param password 密码
   */
  @Public()
  @ApiOperation({ summary: '注册' })
  @Post('/signup')
  signup(@Body() signupData: CreateUserDto) {
    return this.userService.signup(signupData)
  }

  /**
   * 登录
   * @param username 姓名
   * @param password 密码
   */
  @Public()
  @ApiOperation({ summary: '登录' })
  @Post('/login')
  async login(@Body() loginData: CreateUserDto, @Request() req) {
    const agent = Useragent.parse(req.headers['user-agent'])
    const browser = agent.toAgent()
    let loginLocation: string
    try {
      loginLocation = await this.axiosService.getIpAddress(req.ip)
    } catch (error) {}
    const clientInfo = {
      userAgent: req.headers['user-agent'],
      ipaddr: req.ip,
      browser: browser,
      loginLocation,
    }
    return this.userService.login(loginData, clientInfo)
  }

  @ApiOperation({ summary: '获取所有用户' })
  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.userService.findAll()
  }

  @ApiOperation({ summary: '获取单个用户' })
  @ApiBearerAuth()
  @Get('by-id')
  @ApiQuery({
    name: 'id',
    required: true,
    description: '用户id',
    type: Number,
  })
  findOne(@Query('id', ParseIntPipe) userId: number) {
    return this.userService.findOne(userId)
  }

  @ApiOperation({ summary: '根据用户名查用户信息' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'userName',
    required: true,
    description: '用户名',
    type: String,
  })
  @Get('/by-username')
  async getUserByUserName(@Query('userName') userName: string) {
    return this.userService.getUserByUserName(userName)
  }
}
