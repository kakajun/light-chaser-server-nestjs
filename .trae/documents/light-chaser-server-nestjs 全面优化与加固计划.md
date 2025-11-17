## 现状总览
- 框架与依赖：NestJS 11，TypeORM，Swagger，Winston，JWT 等（package.json:1-86）。
- 应用引导：注册 Swagger、ValidationPipe、静态资源、中间件与全局拦截器/过滤器（src/main.ts:11-49）。
- 配置管理：自定义 env 解析，基于 `guazai/.env.*`（config/env.ts:5-26）；`ConfigModule.forRoot({ isGlobal: true, load: [() => envConfig] })`（src/app.module.ts:31-34）。
- 数据库：`TypeOrmModule.forRootAsync` 动态配置，`synchronize` 依赖环境变量（src/app.module.ts:35-53）。
- 日志：Winston 每日滚动写入 `guazai/logs/`，控制台级别为 warn（src/module/monitor/logger/logger.service.ts:10-55）。
- 全局拦截器：请求/响应日志记录（src/core/interceptor/transform/transform.interceptor.ts:9-47）。
- 异常过滤器：统一错误返回结构并记录请求信息（src/core/filter/http-exception/http-exception.filter.ts:8-54）。
- 认证授权：JWT Guard、Strategy、Public 装饰器全部注释停用（src/common/guards/jwt-auth.grard.ts:1-21，src/module/system/auth/jwt-auth.strategy.ts:1-28，src/common/public.decorator.ts:1-5）。
- 模块功能：用户、项目、文件、数据源、SQL 执行器、Axios、Logger 等模块划分清晰（src/module/*）。

## 问题与风险
- 鉴权停用且密钥硬编码：`jwtConstants.secret = 'jiangKey'`（src/common/constants.ts:1-4）；端点标注了 `@ApiBearerAuth()` 但未实际保护（如 src/module/user/user.controller.ts:56-65）。
- SQL 执行器依赖未注册：`@Inject('DATA_SOURCE')` 没有对应 Provider，运行时会报错（src/module/dbExecutor/dbExecutor.service.ts:13-18；src/module/dbExecutor/dbExecutor.module.ts:6-11）。
- 抽象基类误标注实体：`@Entity()` 出现在抽象 BaseEntity 上，可能生成无用表或引起混乱（src/common/entities/base.ts:4-6）。
- 软删除策略不一致：同时存在 `deleted` 标志（BaseEntity）与 `@DeleteDateColumn`（数据源实体）（src/common/entities/base.ts:16-24，src/module/dataSource/entities/dataSource.entity.ts:51-53）。
- 敏感信息日志风险：拦截器和过滤器记录了完整 headers/body，可能泄露密码或令牌（src/core/interceptor/transform/transform.interceptor.ts:12-23，src/core/filter/http-exception/http-exception.filter.ts:16-44）。
- 异常与状态码不规范：业务校验错误统一抛 500（如 src/module/file/file.controller.ts:38-47，src/module/project/project.service.ts:90-104）。
- ValidationPipe 未开启白名单/转换：默认配置可能导致多余字段穿透与类型不匹配（src/main.ts:31-33）。
- 响应结构不统一：存在返回裸字符串与 `ResultData` 混用（src/app.controller.ts:12-21，src/app.service.ts:7-13）。
- 安全中间件缺失：未启用 CORS、Helmet、压缩、可信代理（src/main.ts:11-49）。
- 配置同步风险：`synchronize` 基于 `NODE_ENV`（来自 env 文件），可能在生产误开启（src/app.module.ts:39-51；config/env.ts:5-26）。
- 文件上传使用内存存储：大文件可能占用大量内存，且缺少 multer 层面尺寸/类型限制（src/module/file/file.controller.ts:33-37）。
- Axios 未配置超时/重试：第三方 IP 查询可能阻塞（src/module/axios/axios.service.ts:13-29）。
- 代理场景下真实 IP：Express 未配置可信代理（src/main.ts:11-49）；`request-ip` 在反向代理下可能不准确。
- 测试缺失：Jest 配置存在但无测试文件（jest.config.js:1-14；全局搜索无 *.spec.ts）。
- 代码风格与命名：`jwt-auth.grard.ts` 命名拼写错误（应为 guard），存在未使用注释与控制台输出（如 src/common/utils/index.ts:53-56）。

## 优化目标
- 安全加固：恢复并标准化鉴权；日志脱敏；启用安全中间件；规范异常与状态码。
- 稳定性提升：修正未注册依赖；统一实体与软删除策略；完善配置与环境区分。
- 行为一致性：统一响应结构与 DTO 校验；文档与鉴权对齐。
- 可观测与可测试：完善结构化日志、请求关联 ID、健康检查；补齐单元与 e2e 测试。

## 实施计划（分阶段）
### 阶段 1：安全与配置基础
- 启用 CORS/Helmet/Compression/可信代理，端口与 CORS 白名单走环境变量（修改 src/main.ts）。
- 强化 ValidationPipe：`whitelist`、`forbidNonWhitelisted`、`transform: true`、`validationError: { target: false }`（修改 src/main.ts:31-33）。
- 迁移 JWT 配置到环境：`jwtConstants` 改为读取 `ConfigService`（修改 src/module/user/user.module.ts:13-16，src/common/constants.ts:1-4）。
- 恢复 Auth 模块与全局守卫：启用 `JwtAuthStrategy` 与 `APP_GUARD`，保留 `@Public` 豁免（修改 src/module/system/auth/*、src/app.module.ts:63-70，src/common/public.decorator.ts）。

### 阶段 2：日志与异常
- TransformInterceptor/HttpExceptionFilter：只记录必要字段（URL、方法、响应时间、状态），对 headers/body 进行脱敏（如移除/掩码 `Authorization`、`password`）（修改 src/core/interceptor/transform/transform.interceptor.ts:12-37，src/core/filter/http-exception/http-exception.filter.ts:36-53）。
- Winston 配置改为环境驱动：日志级别、文件路径、最大保留天数从 env 读取；控制台在开发输出 info（修改 src/module/monitor/logger/logger.service.ts:10-55）。
- 统一异常类型与状态码：用 `BadRequestException`/`UnauthorizedException`/`ForbiddenException`/`NotFoundException` 等替代通用 500，服务层尽量返回 `ResultData` 或抛出规范异常（遍历 src/module/* 服务与控制器）。

### 阶段 3：数据库与执行器
- 修复 `DbExecutorService` 的 DataSource 注入：改用 `@InjectDataSource()` 或在 `DbExecutorModule` 定义 Provider 绑定默认应用 DataSource（修改 src/module/dbExecutor/*）。
- 查询安全与资源治理：
  - 仅允许只读 `SELECT`，添加关键字白名单与语法浅解析，拒绝 `;`、`--`、`/* */`、`union`、`into outfile` 等危险片段（修改 src/module/dbExecutor/dbExecutor.service.ts:34-43）。
  - 设置超时、最大返回行数与结果分页；执行前后结构化记录耗时但不记录完整 SQL（或截断）（修改 src/module/dbExecutor/dbExecutor.service.ts:46-61）。
  - 多数据源类型支持：根据 `DataSourceEntity.type` 映射到 `typeorm` 的 `type`（修改 src/module/dataSource/dataSource.service.ts:126-149）。
- 实体层一致性：
  - 移除抽象基类上的 `@Entity()` 注解（修改 src/common/entities/base.ts:4-6）。
  - 统一软删除策略：选择使用 `deleted` 标志或 `@DeleteDateColumn` 一种，服务层查询统一过滤（修改 src/common/entities/base.ts、相关实体与查询）。

### 阶段 4：文件上传
- 将 multer 切换为磁盘存储或流式落盘；在 multer 层设置 `fileFilter` 和 `limits`（修改 src/module/file/file.controller.ts:32-37）。
- 继续保留哈希去重与路径拼接；错误码细化为 4xx（修改 src/module/file/file.service.ts:37-102、104-128、130-165）。

### 阶段 5：API 与文档一致性
- 响应结构统一：
  - 方案 A：启用拦截器 `map` 包装统一 `{ code, msg, data }`（src/core/interceptor/transform/transform.interceptor.ts:40-47）。
  - 方案 B：所有控制器/服务统一返回 `ResultData`，不再混用裸值（如 src/app.controller.ts:12-21）。
- 清理注释与拼写问题：`jwt-auth.grard.ts` → `jwt-auth.guard.ts`，移除冗余注释与 `console.log`（如 src/common/utils/index.ts:53-56）。
- Swagger 文档：定义统一响应模型，鉴权说明与实际守卫一致；简化多余 `@ApiBearerAuth()` 标注。

### 阶段 6：可观测性与测试
- 请求关联 ID：中间件为每个请求注入 `X-Request-Id` 并在日志中打通（新增中间件与在 logger 中加入字段）。
- 健康检查：新增 `/health`（存活、就绪）端点，检测数据库连接与磁盘写入权限。
- 测试补齐：
  - 单元测试：UserService、ProjectService、FileService、DbExecutorService 的关键逻辑。
  - e2e 测试：登录、鉴权保护、文件上传、项目 CRUD、数据源连接测试。

### 阶段 7：部署与配置强化
- 端口、日志路径、静态路径、DB 连接参数全面走环境；`synchronize` 在生产强制关闭。
- 代理/容器：`app.set('trust proxy', 1)`；Axios 默认超时与重试，保证第三方调用不阻塞（src/module/axios/axios.service.ts:16-29）。
- Nginx/PM2：检查代理头与超时策略，PM2 内存与日志轮转；启动脚本与环境加载一致性（nginx.conf、ecosystem.config.js、start.sh）。

## 交付与验收
- 代码变更包含：主启动文件、安全中间件、日志/异常、认证模块、执行器与实体层调整、上传策略、文档与测试。
- 验收标准：通过 e2e 测试、Swagger 文档与实际鉴权一致、关键路径日志与性能正常、生产环境 `synchronize` 关闭、敏感信息不落日志。

## 备注
- 为避免生产数据风险，数据库迁移需先在测试环境验证；涉及 `synchronize` 的改动需谨慎推进。
- 如选择响应拦截器统一包装，需同步前端适配。