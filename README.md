# light-chaser-server-nestjs

> LIGHT CASER 数据可视化编辑器后端基础开源版

[![build status](https://github.com/kakajun/light-chaser-server-nestjs/actions/workflows/docker-image.yml/badge.svg?branch=main)](https://github.com/kakajun/light-chaser-server-nestjs/actions/workflows/docker-image.yml/badge.svg?branch=main)

#### 技术栈

1. Nestjs 10
2. Typeorm 0.3.20
3. 开发sqlite3 5.1.7 正式: mysql
4. docker 镜像构建

本项目支持前端大屏项目 [light-chaser-server](https://github.com/xiaopujun/light-chaser)

转翻译java后端工程 [light-chaser-server](https://github.com/xiaopujun/light-chaser-server)

## 说明

1. 目前NestJs工程不需要token验证, 如果需要可以把 `app.module.ts` 中的全局守卫打开
2. 项目由于使用sqlite, 所以不需要连接其他数据库或redis, 装上依赖, 然后直接 `npm run dev` 即可
3. 推送代码自动构建阿里云镜像

## 预览地址

[后端文档](http://114.55.91.77:3000/docs)

[前端](http://114.55.91.77:7880)

## 持续集成部署步骤

1. 准备阿里云镜像仓库(免费)和Ecs服务器(收费),阿里云镜像创建库命名为`light-chaser`, 镜像库地址记下,待会用
2. fock 项目, 在github的设置中,选择`Secrets and variables`中的`Actions`,然后在`Secrets`中点击`Add repository secret`添加`ALIYUN_DOCKER_PASSWORD`,`ALIYUN_DOCKER_USERNAME`,`SERVER_HOST`,`SERVER_SSH_KEY`,`SERVER_USERNAME`
3. 修改`deploy.yml`文件,把自己的阿里镜像地址替换上去, 提交代码, 会触发workflows的`deploy.yml`文件
4. docker 拉取mysql, 注意把`123456`换成自己的密码, `docker run --name my-mysql -e MYSQL_ROOT_PASSWORD=123456 -p 3306:3306 -d mysql`
5. 登陆ecs服务器,把guazai整个目录拷贝到root下,重命名为修改/root/nestguazai, 里面的.env.prod文件的数据库账号和密码
6. 修改配置, 推送代码, 然后github就会自动构建镜像, 然后把镜像推送到阿里云镜像仓库中
7. 把阿里云安全端口 80,8001,3000端口都放开
8. 等待流程跑完, 检测服务是否正常 `curl -I http://localhost:3000/docs`

### 镜像一键安装,真正修改代码一键部署

包含前端, 后端, ngnix

docker pull ghcr.io/kakajun/light-chaser-server-nestjs:32d3cd960ac92b82e0bee2ea4ef0d73c8fb8c23b

1. 拉取镜像`docker pull ghcr.io/kakajun/light-chaser-server-nestjs:latest`
2. 创建目录 `mkdir /root/nestguazai`
3. 创建容器

```bash
docker run -d \
  -p 8090:80\
  -p 3000:3000 \
  --restart=always \
  --name light-chaser \
  -v /root/nestguazai:/app/guazai \
light-chaser-server-nestjs:latest
```

4. 修改/root/nestguazai 里面的数据库密码
5. 启动容器 `docker restart light-chaser`

#### 启动 [localhost](http://localhost:8090/)

#### 说明

镜像包含前端, 后端, ngnix, 已更新到最新依赖

加入简单登陆功能, 用户名: admin, 密码: admin

[前端镜像源码地址](https://github.com/kakajun/light-chaser)
