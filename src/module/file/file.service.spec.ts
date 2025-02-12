import { Test, TestingModule } from '@nestjs/testing'
import { FileService } from './file.service'
import { ConfigService } from '@nestjs/config'

describe('FileService', () => {
  let service: FileService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              // 根据需要返回不同的配置值
              switch (key) {
                case 'UPLOAD_DIR':
                  return '/path/to/upload/dir'
                default:
                  return null
              }
            }),
          },
        },
      ],
    }).compile()

    service = module.get<FileService>(FileService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
