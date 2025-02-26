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

# 安装 pm2
RUN npm install -g pm2

# 从后端构建阶段复制构建结果
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/guazai ./guazai

# 从前端镜像复制静态文件
COPY --from=frontend /usr/app/light-chaser ./frontend

# 暴露端口
EXPOSE 3000

# 启动后端应用
CMD ["pm2-runtime", "dist/src/main.js"]
