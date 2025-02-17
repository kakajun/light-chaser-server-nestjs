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

## 预览地址

[后端文档](http://114.55.91.77:3000/docs)

[前端](http://114.55.91.77:8001)

## 待处理问题
1. 刷新404

## 持续集成部署步骤
1. 准备阿里云镜像仓库(免费)和Ecs服务器(收费)
2. fock 项目, 在github的设置中,选择`Secrets and variables`中的`Actions`,然后在`Secrets`中点击`Add repository secret`添加`ALIYUN_DOCKER_PASSWORD`,`ALIYUN_DOCKER_USERNAME`,`SERVER_HOST`,`SERVER_SSH_KEY`,`SERVER_USERNAME`
3. 修改`deploy.yml`文件,把自己的阿里镜像地址替换上去,  提交代码, 会触发workflows的`deploy.yml`文件
4. docker 拉取mysql, 注意把`123456`换成自己的密码,  `docker run --name my-mysql -e MYSQL_ROOT_PASSWORD=123456 -p 3306:3306 -d mysql`
5. 登陆ecs服务器修改/root/nestguazai 里面的.env.prod文件的数据库账号和密码
6. linux安装ngnix, 然后修改ngnix的配置文件(放在最下面), 然后重启ngnix
7. 把阿里云安全端口 80,8001,3000端口都放开
8. 检测服务是否正常 `curl -I http://114.55.91.77:3000/docs`


## Ngnix 配置
```
worker_processes  2;

# events段配置信息
events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    sendfile            on;
    tcp_nopush          on;
    keepalive_timeout   65;
    gzip  on;

    # 第一个 server 块
    server {
        listen  80;
        server_name  localhost;

        index index.html;

        location / {
            root html;
            index  index.html;

        if ($request_uri ~* "/index.html") {
            add_header Cache-Control "no-store";
        }
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }

    # 第二个 server 块
    server {
        listen  8001;
        server_name  localhost;
        index index.html;

        location / {
            root html/light-chaser-app2;
            try_files $uri $uri/ /index.html;
        }

        location ~ ^/(api|static)/ {
            proxy_pass http://114.55.91.77:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```
