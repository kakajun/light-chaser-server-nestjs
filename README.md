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

        location /vue3-sketch-ruler/ {
            index  index.html;
            try_files $uri $uri/ /vue3-sketch-ruler/index.html;
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
