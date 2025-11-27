import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DataSource } from 'typeorm'

describe('AppController', () => {
  let appController: AppController
  let dataSource: DataSource

  beforeEach(async () => {
    dataSource = {
      createQueryRunner: () => ({
        connect: async () => {},
        query: async () => 1,
        release: async () => {},
      }),
    } as any

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: DataSource, useValue: dataSource }],
    }).compile()

    appController = module.get<AppController>(AppController)
  })

  it('should return Hi', () => {
    expect(appController.getHi()).toBe('Hi!')
  })

  it('should return hello result', () => {
    const res = appController.getHello()
    expect(res).toEqual({ code: 200, msg: '操作成功', data: 'Hello World!' })
  })

  it('health up', async () => {
    const res = await appController.health()
    expect(res.code).toBe(200)
    expect(res.data.status).toBe('up')
  })
})
