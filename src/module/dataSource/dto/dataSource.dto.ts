import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator'
import { PagingDto } from '@/common/dto/index'

export class CreateDataSourceDto {
  @ApiProperty({ description: '数据库名称', example: 'MyDataSource' })
  @IsString()
  @Length(0, 50)
  @IsNotEmpty({ message: '数据库名称必填' })
  name: string

  @ApiProperty({ description: '数据源类型', example: 'MySQL' })
  @IsString()
  @Length(0, 20)
  @IsNotEmpty({ message: '数据源类型必填' })
  type: string

  @ApiProperty({ description: '用户名', example: 'user123' })
  @IsString()
  @IsOptional()
  username?: string

  @ApiProperty({ description: '数据源链接密码', example: 'securepassword123' })
  password?: string

  @ApiProperty({ description: '数据源链接地址', example: 'localhost:3306' })
  @IsString()
  @IsOptional()
  url?: string

  @ApiProperty({ description: '数据源链接描述', example: 'This is a MySQL database', required: false })
  @IsString()
  @IsOptional()
  des?: string
}

export class ListDataSourcetDto extends PagingDto {
  @ApiProperty({ description: '数据源名称', example: 'MyDataSource' })
  searchValue?: string
}
