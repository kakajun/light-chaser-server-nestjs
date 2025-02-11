import { ApiBearerAuth, ApiOperation, ApiParam, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger'
import { ArticleService } from './article.service'
import { Body, Controller, Request, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { CreateArticleDto, UpdateArticleDto, ListArticleData } from './dto/article.dto'

@ApiTags('文章')
@Controller('articles')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    // private readonly logger: LoggerService,
  ) {}

  @ApiOperation({ summary: '创建文章' })
  @ApiBearerAuth()
  @Post('/create')
  async create(@Body() post: CreateArticleDto, @Request() req) {
    post['createBy'] = req.user.username
    return await this.articleService.create(post)
  }

  @ApiOperation({ summary: '获取所有文章列表' })
  @ApiQuery({
    name: 'createBy',
    required: false,
    description: '作者',
    type: String,
  })
  @ApiQuery({
    name: 'content',
    required: false,
    description: '内容',
    type: String,
  })
  @ApiBearerAuth()
  @Get('/findAll')
  findAll(@Query() query: ListArticleData) {
    return this.articleService.findAll(query)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '通过ID获取指定文章' })
  @Get('find/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: '文章的唯一标识符',
    type: String,
  })
  async findById(@Param('id') id) {
    return await this.articleService.findById(id)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '更新文章' })
  @Put()
  @ApiBody({ type: UpdateArticleDto, description: '更新文章的内容' })
  async update(@Body() post: UpdateArticleDto) {
    return await this.articleService.update(post)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '通过ID删除文章' })
  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: '文章的唯一标识符',
    type: String,
  })
  async remove(@Param('id') id: string) {
    return await this.articleService.remove(id)
  }

  @ApiOperation({ summary: '根据用户名查关联文章' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'userName',
    required: true,
    description: '作者',
    type: String,
  })
  @Get('with-articles')
  async getUsersWithPosts(@Query() query) {
    return this.articleService.findUsersWithArticles(query.userName)
  }

  @ApiOperation({ summary: '根据用户名分页查关联文章,不查用户' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'userName',
    required: true,
    description: '作者',
    type: String,
  })
  @ApiQuery({
    name: 'current',
    required: false,
    description: '页码',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: '每页大小',
    example: 10,
    type: Number,
  })
  @Get('user/:userName')
  async findArticlesByUserName(
    @Param('userName') userName: string,
    @Query('current') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    console.log('Searching for userName:', userName) // 添加日志
    return await this.articleService.findArticlesByUserName(userName, page, pageSize)
  }
}
