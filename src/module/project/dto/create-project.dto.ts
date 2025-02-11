import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateProjectDto {
  @ApiProperty({ description: 'sql' })
  @IsNotEmpty({ message: 'sql不能为空' })
  readonly sql: string
}
