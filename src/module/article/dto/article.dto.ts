import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator'
import { PagingDto } from '@/common/dto/index'
export enum StatusEnum {
  STATIC = '0',
  DYNAMIC = '1',
}

export class CreateArticleDto {
  @ApiProperty({ description: '文章标题' })
  @IsString()
  @IsNotEmpty({ message: '文章标题必填' })
  readonly title: string

  @ApiPropertyOptional({ description: '内容' })
  @IsString()
  readonly content: string

  @ApiPropertyOptional({ description: '文章封面' })
  @IsString()
  readonly cover_url: string
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @ApiProperty({ description: '文章ID' })
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  id: number
}

export class ListArticleData extends PagingDto {
  @IsOptional()
  @IsString()
  @Length(0, 100)
  tittle?: string

  @IsOptional()
  @IsString()
  @Length(0, 100)
  content?: string

  @IsOptional()
  @IsString()
  @Length(0, 100)
  createBy?: string

  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string
}
