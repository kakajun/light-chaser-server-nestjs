import { Test, TestingModule } from '@nestjs/testing'
import { FileService } from './file.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { FileEntity } from './entities/file.entity'
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs'

describe('FileService', () => {
  let service: FileService
  const repo = { findOne: jest.fn(), save: jest.fn(), create: jest.fn((v) => v) }
  const config = { get: jest.fn((k) => (k === 'PROJECT_RESOURCE_PATH' ? 'tmp' : k === 'SOURCE_IMAGE_PATH' ? '/images/' : null)) }

  beforeEach(async () => {
    jest.spyOn(fs.promises as any, 'mkdir').mockResolvedValue(undefined)
    jest.spyOn(fs.promises as any, 'writeFile').mockResolvedValue(undefined)
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        { provide: getRepositoryToken(FileEntity), useValue: repo },
        { provide: ConfigService, useValue: config },
      ],
    }).compile()
    service = module.get<FileService>(FileService)
  })

  it('upload image', async () => {
    ;(repo.findOne as any).mockResolvedValue(null)
    const file: any = { originalname: 'a.png', buffer: Buffer.from('x'), mimetype: 'image/png', size: 10 }
    const res = await service.uploadImage(file, 1)
    expect(res.code).toBe(200)
  })
})