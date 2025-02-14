# 第一阶段：构建应用
FROM node:latest as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 第二阶段：设置生产环境
FROM node:alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main"]

# docker run -d -p 3000:3000 light-chaser-server-nestjs:latest
