# light-chaser-server-nestjs

## LIGHT CASER 数据可视化编辑器后端基础开源版

Nestjs 10
Typeorm 0.3.20
sqlite3 5.1.7

本项目支持前端大屏项目 [light-chaser-server](https://github.com/xiaopujun/light-chaser)

转翻译java后端工程 [light-chaser-server](https://github.com/xiaopujun/light-chaser-server)

## 说明

1. 目前工程不需要token验证, 如果需要可以把 `app.module.ts` 中的全局守卫打开
2. 项目由于使用sqlite, 所以不需要连接其他数据库或redis, 装上依赖, 然后直接 `npm run dev` 即可
3. 推送代码自动构建阿里云镜像
