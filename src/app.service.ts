import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from './module/user/entities/user.entity'
import { UserService } from './module/user/user.service'
import { ResultData } from '@/common/utils/result'

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly userService: UserService, // 注入 UserService
  ) {}
  getHi(): string {
    return 'Hi!'
  }

  getHello() {
    return ResultData.ok('Hello World!')
  }
}
