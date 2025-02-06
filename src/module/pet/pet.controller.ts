import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiBody, ApiTags } from '@nestjs/swagger'
import { PetService } from './pet.service'
import { CreatePetDto } from './dto/create-pet.dto'
import { UpdatePetDto } from './dto/update-pet.dto'

@ApiTags('记录小动物')
@Controller('pet')
export class PetController {
  constructor(private readonly petService: PetService) {}

  /**
   * @description: 记录小动物名称和生日
   */
  @ApiOperation({ summary: '记录小动物信息' })
  @ApiBearerAuth()
  @Post('recordPet')
  create(@Body() post: CreatePetDto) {
    return this.petService.create(post)
  }

  @ApiOperation({ summary: '获取所有记录信息' })
  @ApiBearerAuth()
  @Get()
  async findAll(@Query() query) {
    try {
      const result = await this.petService.findAll(query)
      return result
    } catch (error) {
      throw error
    }
  }

  @ApiOperation({ summary: '根据id查询小动物信息' })
  @ApiBearerAuth()
  @Get('find/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: '唯一标识符',
    type: String,
  })
  findOne(@Param('id') id: string) {
    return this.petService.findById(+id)
  }

  @ApiOperation({ summary: '根据id更新小动物信息' })
  @ApiBearerAuth()
  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: '唯一标识符',
    type: String,
  })
  @ApiBody({ type: UpdatePetDto, description: '更新内容' })
  update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petService.updateById(+id, updatePetDto)
  }

  @ApiOperation({ summary: '根据id删除小动物信息' })
  @ApiBearerAuth()
  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: '唯一标识符',
    type: String,
  })
  remove(@Param('id') id: string) {
    return this.petService.remove(+id)
  }
}
