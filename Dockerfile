# 第一阶段：构建应用
FROM node:latest as builder
WORKDIR /usr/src/app

# 安装 pnpm
RUN npm install -g pnpm

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN pnpm run build

# 第二阶段：设置生产环境
FROM node:alpine
WORKDIR /usr/src/app

# 安装 pnpm
RUN npm install -g pnpm
# 安装 pnpm 和 pm2
RUN npm install -g pnpm pm2

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/guazai ./guazai

EXPOSE 3000
CMD ["pm2-runtime", "dist/src/main.js"]
