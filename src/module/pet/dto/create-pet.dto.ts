import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreatePetDto {
  @ApiProperty({ description: '小动物的名字', example: '小花' })
  @IsNotEmpty({ message: '名字不能为空' })
  @MinLength(2, { message: '名字至少需要 2 个字符' })
  @MaxLength(50, { message: '名字不能超过 50 个字符' })
  readonly name: string;

  @ApiProperty({ description: '出生日期', example: '2023-01-01' })
  @IsDateString({}, { message: '生日必须是有效的日期格式，例如 2022-08-09' })
  readonly birthday: string;
}
