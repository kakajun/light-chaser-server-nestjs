import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from './user.service'
import { Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { UserEntity } from './entities/user.entity'
import { JwtService } from '@nestjs/jwt'
import * as bcryptjs from 'bcryptjs'

describe('UserService', () => {
  let service: UserService
  let repo: Repository<UserEntity>
  let jwt: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: { findOne: jest.fn(), findOneBy: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn() },
        },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'token') } },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    repo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity))
    jwt = module.get<JwtService>(JwtService)
  })

  it('login success', async () => {
    const password = bcryptjs.hashSync('123456', 10)
    ;(repo.findOne as any).mockResolvedValue({ userId: 1, userName: 'a', password })
    const res = await service.login(
      { userName: 'a', password: '123456' },
      { ipaddr: '1.1.1.1', userAgent: '', browser: '', loginLocation: '' },
    )
    expect(jwt.sign).toHaveBeenCalled()
    expect(res.code).toBe(200)
    expect(typeof res.data).toBe('string')
  })

  it('login fail', async () => {
    ;(repo.findOne as any).mockResolvedValue({ userId: 1, userName: 'a', password: 'bad' })
    const res = await service.login(
      { userName: 'a', password: '123456' },
      { ipaddr: '1.1.1.1', userAgent: '', browser: '', loginLocation: '' },
    )
    expect(res.code).toBe(500)
  })
})
