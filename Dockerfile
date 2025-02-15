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

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/src/main"]
