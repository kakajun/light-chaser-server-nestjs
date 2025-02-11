import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ArticleService } from './article.service'
import { ArticleEntity } from './entities/article.entity'
import { UserEntity } from '@/module/user/entities/user.entity'
import { ResultData } from '@/common/utils/result'

describe('ArticleService', () => {
  let service: ArticleService
  let articleRepository: Repository<ArticleEntity>
  let userRepository: Repository<UserEntity>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(ArticleEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              orderBy: jest.fn().mockReturnThis(),
              getCount: jest.fn(),
              limit: jest.fn().mockReturnThis(),
              offset: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn(),
            })),
            merge: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getOne: jest.fn(),
            })),
          },
        },
      ],
    }).compile()

    service = module.get<ArticleService>(ArticleService)
    articleRepository = module.get<Repository<ArticleEntity>>(getRepositoryToken(ArticleEntity))
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a new article', async () => {
      const articleData = { title: 'Test Article', content: 'Test Content' }
      ;(articleRepository.findOne as jest.Mock).mockResolvedValueOnce(null)
      ;(articleRepository.save as jest.Mock).mockResolvedValueOnce(articleData)

      const result = await service.create(articleData)
      expect(result).toEqual(ResultData.ok())
      expect(articleRepository.findOne).toHaveBeenCalledWith({ where: { title: articleData.title } })
      expect(articleRepository.save).toHaveBeenCalledWith(articleData)
    })

    it('should throw an exception if the title is missing', async () => {
      const articleData = { content: 'Test Content' }
      await expect(service.create(articleData)).rejects.toThrow('缺少文章标题')
    })

    it('should throw an exception if the article already exists', async () => {
      const articleData = { title: 'Test Article', content: 'Test Content' }
      ;(articleRepository.findOne as jest.Mock).mockResolvedValueOnce({})

      await expect(service.create(articleData)).rejects.toThrow('文章已存在')
    })
  })

  describe('findAll', () => {
    it('should return a list of articles', async () => {
      const query = { current: 1, pageSize: 10 }
      const mockArticles = [{ id: 1, title: 'Test Article', delFlag: '0', content: 'XXX', createBy: 'bb', status: 0 }]
      const mockCount = 1
      ;(articleRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        andWhere: jest.fn().mockReturnThis(), // 添加 andWhere 以支持条件查询
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockArticles, mockCount]),
      })

      const result = await service.findAll(query)
      expect(result).toEqual(
        ResultData.ok({
          list: mockArticles,
          total: mockCount,
        }),
      )
    })
  })

  describe('update', () => {
    it('should update an existing article', async () => {
      const mockArticle = { id: 1, title: 'Test Article' }
      const updatedArticleData = { id: 1, title: 'Updated Article' }
      ;(articleRepository.findOne as jest.Mock).mockResolvedValueOnce(mockArticle)
      ;(articleRepository.merge as jest.Mock).mockReturnValueOnce(updatedArticleData)
      ;(articleRepository.save as jest.Mock).mockResolvedValueOnce(updatedArticleData)

      const result = await service.update(updatedArticleData)
      expect(result).toEqual(ResultData.ok(updatedArticleData))
      expect(articleRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } })
      expect(articleRepository.merge).toHaveBeenCalledWith(mockArticle, updatedArticleData)
      expect(articleRepository.save).toHaveBeenCalledWith(updatedArticleData)
    })

    it('should throw an exception if the article does not exist', async () => {
      const updatedArticleData = { id: 1, title: 'Updated Article' }
      ;(articleRepository.findOne as jest.Mock).mockResolvedValueOnce(null)

      await expect(service.update(updatedArticleData)).rejects.toThrow('id为1的文章不存在')
    })
  })

  describe('remove', () => {
    it('should remove an existing article', async () => {
      const mockArticle = { id: 1, title: 'Test Article' }
      ;(articleRepository.findOne as jest.Mock).mockResolvedValueOnce(mockArticle)
      ;(articleRepository.remove as jest.Mock).mockResolvedValueOnce(mockArticle)

      const result = await service.remove(1)
      expect(result).toEqual(ResultData.ok())
      expect(articleRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } })
      expect(articleRepository.remove).toHaveBeenCalledWith(mockArticle)
    })

    it('should throw an exception if the article does not exist', async () => {
      ;(articleRepository.findOne as jest.Mock).mockResolvedValueOnce(null)

      await expect(service.remove(1)).rejects.toThrow('id为1的文章不存在')
    })
  })

  describe('findUsersWithArticles', () => {
    it('should return a user with their articles', async () => {
      const mockUser = {
        userId: 1,
        userName: 'testuser',
        sex: '0',
        articles: [{ id: 1, title: 'Test Article', delFlag: 0, content: 'XXX', createBy: 'bb', status: 0 }],
      }
      ;(userRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      })

      const result = await service.findUsersWithArticles('testuser')
      expect(result).toEqual(ResultData.ok(mockUser))
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user')
      expect(userRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledWith('user.articles', 'article')
      expect(userRepository.createQueryBuilder().where).toHaveBeenCalledWith('user.userName = :name', {
        name: 'testuser',
      })
      expect(userRepository.createQueryBuilder().getOne).toHaveBeenCalled()
    })

    it('should throw an exception if the user does not exist', async () => {
      ;(userRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      })

      await expect(service.findUsersWithArticles('nonexistentuser')).rejects.toThrow(
        '用户名为nonexistentuser的作者不存在',
      )
    })
  })

  describe('findArticlesByUserName', () => {
    it('should return articles by user name with pagination', async () => {
      const mockArticles = [{ id: 1, title: 'Test Article' }]
      const mockCount = 1
      ;(articleRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockArticles, mockCount]),
      })

      const result = await service.findArticlesByUserName('testuser', 1, 10)
      expect(result).toEqual(
        ResultData.ok({
          list: mockArticles,
          total: mockCount,
        }),
      )
      expect(articleRepository.createQueryBuilder).toHaveBeenCalledWith('article')
      expect(articleRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledWith('article.user', 'user')
      expect(articleRepository.createQueryBuilder().where).toHaveBeenCalledWith('user.userName = :userName', {
        userName: 'testuser',
      })
      expect(articleRepository.createQueryBuilder().skip).toHaveBeenCalledWith(0)
      expect(articleRepository.createQueryBuilder().take).toHaveBeenCalledWith(10)
      expect(articleRepository.createQueryBuilder().select).toHaveBeenCalledWith([
        'article.id',
        'article.title',
        'article.content',
        'article.thumb_url',
        'article.create_by',
        'article.create_time',
        'article.update_by',
        'article.update_time',
        'article.remark',
      ])
      expect(articleRepository.createQueryBuilder().getManyAndCount).toHaveBeenCalled()
    })
  })
})
