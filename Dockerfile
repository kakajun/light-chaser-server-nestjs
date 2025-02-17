# 第一阶段：构建应用
FROM node:20.12.0 as builder
WORKDIR /app

COPY package*.json ./
RUN npm  install

COPY . .
RUN pnpm run build

# 第二阶段：设置生产环境
FROM node:alpine
WORKDIR /app

# 安装 pnpm 和 pm2
RUN npm install -g  pm2

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/guazai ./guazai

EXPOSE 3000
CMD ["pm2-runtime", "dist/src/main.js"]
