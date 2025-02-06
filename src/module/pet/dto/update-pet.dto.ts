import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdatePetDto {
  @ApiPropertyOptional({ description: '姓名' })
  @IsOptional()
  @IsString()
  readonly name?: string

  @ApiPropertyOptional({ description: '生日' })
  @IsOptional()
  @IsString()
  readonly birthday?: string
}
