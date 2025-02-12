import { ApiProperty } from '@nestjs/swagger'

export class DbExecutorDto {
  @ApiProperty({ description: 'sql' })
  readonly sql: string

  readonly id: number
}
