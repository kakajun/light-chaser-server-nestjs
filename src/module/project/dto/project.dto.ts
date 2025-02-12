import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsOptional } from 'class-validator'

import { PagingDto } from '@/common/dto/index'

export class ListProjectDto extends PagingDto {
  @ApiProperty({ description: '项目名称', example: 'Example Project' })
  searchValue: string
}

export class CreateProjectDto {
  @ApiProperty({ description: '项目名称', example: 'Example Project' })
  @IsString()
  @IsNotEmpty({ message: '项目名称必填' })
  name: string

  @ApiProperty({ description: '项目描述', example: 'This is an example project.' })
  @IsString()
  des?: string

  @ApiProperty({ description: '数据JSON', example: '{}' })
  @IsString()
  dataJson?: string

  @ApiProperty({ description: '封面图片路径', example: '/path/to/cover.jpg' })
  @IsString()
  @IsOptional()
  cover?: string
}
