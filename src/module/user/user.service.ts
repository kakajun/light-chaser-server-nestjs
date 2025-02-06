import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from './entities/user.entity'
import { CreateUserDto, ClientInfoDto } from './dto/create-users.dto'
import * as bcryptjs from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import { ResultData } from '@/common/utils/result'
import { GetNowDate, GenerateUUID } from '@/common/utils/index'
import { CacheEnum } from '@/common/enum/index'
import { LOGIN_TOKEN_EXPIRESIN } from '@/common/constant/index'
import { plainToInstance } from 'class-transformer'
import { RedisService } from '@/module/redis/redis.service'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  // 注册
  async signup(user: CreateUserDto) {
    const userData = await this.userRepo.findOne({
      where: { userName: user.userName },
    })
    if (userData && userData.userName === user.userName)
      return ResultData.fail(500, `保存用户'${user.userName}'失败，注册账号已存在`)
    // 对密码进行加密处理
    user.password = bcryptjs.hashSync(user.password, 10)
    const loginDate = GetNowDate()
    await this.userRepo.save({ ...user, loginDate })
    return ResultData.ok()
  }

  // 登录
  async login(user: CreateUserDto, clientInfo: ClientInfoDto) {
    const data = await this.userRepo.findOne({
      where: { userName: user.userName },
    })
    if (!(data && bcryptjs.compareSync(user.password, data.password))) {
      return ResultData.fail(500, `帐号或密码错误`)
    }
    const loginDate = GetNowDate()
    await this.userRepo.update(
      {
        userId: data.userId,
      },
      {
        loginDate: loginDate,
        loginIp: clientInfo.ipaddr,
      },
    )

    const uuid = GenerateUUID()
    const payload = { username: data.userName, loginDate, uuid }
    const metaData = {
      browser: clientInfo.browser,
      ipaddr: clientInfo.ipaddr,
      loginTime: loginDate,
      token: uuid,
      user: data,
      userId: data.userId,
      username: data.userName,
    }
    await this.redisService.set(`${CacheEnum.LOGIN_TOKEN_KEY}${uuid}`, metaData, LOGIN_TOKEN_EXPIRESIN)
    return ResultData.ok(this.jwtService.sign(payload), '登录成功')
  }

  /**
   * 从数据声明生成令牌
   *
   * @param payload 数据声明
   * @return 令牌
   */
  createToken(payload: { uuid: string; userId: number }): string {
    const accessToken = this.jwtService.sign(payload)
    return accessToken
  }

  async findAll() {
    const data = await this.userRepo.find()
    const users = plainToInstance(UserEntity, data, {
      excludeExtraneousValues: true,
    })
    return ResultData.ok(users)
  }


  async findOne(userId: number) {
    const data = await this.userRepo.findOneBy({ userId })
    return ResultData.ok(data)
  }

  async getUserByUserName(userName: string) {
    const user = await this.userRepo.findOne({
      where: { userName },
    })

    if (!user) {
      throw new NotFoundException(`User with username ${userName} not found`)
    }
    return ResultData.ok(user)
  }

  async remove(userId: number) {
    await this.userRepo.delete(userId)
    return ResultData.ok()
  }
}
