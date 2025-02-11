import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateDbExecutorDto {
  @ApiProperty({ description: 'sql' })
  @IsNotEmpty({ message: 'sql不能为空' })
  readonly sql: string
}
