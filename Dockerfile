# 第一阶段：构建后端应用
FROM node:20.12.0 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 第二阶段：拉取前端镜像,这里前端镜像改成你自己的
FROM ghcr.io/kakajun/light-chaser:latest as frontend
WORKDIR /usr/app/light-chaser

# 第三阶段：设置 Nginx 和后端环境
FROM node:alpine
WORKDIR /app

# 安装 Nginx 和 PM2
RUN apk add --no-cache nginx && npm install -g pm2

# 复制前端文件
COPY --from=frontend /usr/app/light-chaser /usr/share/nginx/html

# 复制后端文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/guazai ./guazai

# 复制 Nginx 配置文件
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

# 复制启动脚本并设置权限
COPY --from=builder /app/start.sh /start.sh
RUN chmod +x /start.sh

# 暴露端口
EXPOSE 8080 3000

# 启动 Nginx 和后端应用
CMD ["/start.sh"]
