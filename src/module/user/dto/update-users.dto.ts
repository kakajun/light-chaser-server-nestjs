import { PartialType } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import { CreateUserDto } from './create-users.dto'
import { IsNumber } from 'class-validator'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  userId: number
}
