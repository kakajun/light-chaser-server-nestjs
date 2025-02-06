import { IsString, IsEnum, Length, IsOptional, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import { PagingDto } from '@/common/dto/index'

export enum StatusEnum {
  STATIC = '0',
  DYNAMIC = '1',
}

export class CreateDictTypeDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @Length(0, 100)
  dictName: string

  @ApiProperty({
    required: true,
  })
  @IsString()
  @Length(0, 100)
  dictType: string

  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  remark?: string

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string
}

export class UpdateDictTypeDto extends CreateDictTypeDto {
  @IsNumber()
  dictId: number
}

export class ListDictType extends PagingDto {
  @IsOptional()
  @IsString()
  @Length(0, 100)
  dictName?: string

  @IsOptional()
  @IsString()
  @Length(0, 100)
  dictType?: string

  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string
}

export class CreateDictDataDto {
  @ApiProperty({ required: true, description: '字典类型', maxLength: 100 })
  @IsString()
  @Length(0, 100)
  dictType: string

  @ApiProperty({ required: true, description: '字典标签', maxLength: 100 })
  @IsString()
  @Length(0, 100)
  dictLabel: string

  @ApiProperty({ required: true, description: '字典值', maxLength: 100 })
  @IsString()
  @Length(0, 100)
  dictValue: string

  @ApiProperty({ required: true, description: '列表样式', maxLength: 100 })
  @IsString()
  @Length(0, 100)
  listClass: string

  @ApiProperty({ required: false, description: '字典排序', type: Number })
  @IsOptional()
  @IsNumber()
  dictSort?: number

  @ApiProperty({ required: false, description: '备注', maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  remark?: string

  @ApiProperty({ required: false, description: '状态', enum: StatusEnum })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string
}

export class UpdateDictDataDto extends CreateDictDataDto {
  @IsNumber()
  dictCode: number
}

export class ListDictData extends PagingDto {
  @IsOptional()
  @IsString()
  @Length(0, 100)
  dictLabel?: string

  @IsOptional()
  @IsString()
  @Length(0, 100)
  dictType?: string

  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string
}
