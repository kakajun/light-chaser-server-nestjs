import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ description: '姓名' })
  @IsNotEmpty({ message: '姓名必填' })
  userName: string

  @ApiProperty({ description: '密码' })
  @IsNotEmpty({ message: '密码必填' })
  password: string

  loginDate?: string
}

export class ClientInfoDto {
  ipaddr: string
  userAgent: string
  browser: string
  loginLocation: string
}
