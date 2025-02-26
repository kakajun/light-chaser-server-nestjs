# 第一阶段：构建后端应用
FROM node:20.12.0 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 第二阶段：拉取前端镜像
FROM ghcr.io/kakajun/light-chaser:134ce884005d60a0c4fdab12ea314dcfdf8c13d6 as frontend
WORKDIR /usr/app/light-chaser

# 第三阶段：设置生产环境
FROM node:alpine
WORKDIR /app
RUN npm install -g pm2
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/guazai ./guazai

# 设置 Nginx 环境
FROM nginx:alpine
COPY --from=frontend /usr/app/light-chaser /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 3000 80

# 启动脚本
COPY ./start.sh /start.sh
RUN chmod +x /start.sh

# 启动Nginx和后端应用
CMD ["/start.sh"]
