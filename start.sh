#!/bin/sh
# 启动Nginx
nginx -g 'daemon off;' &
# 启动后端应用
pm2-runtime dist/src/main.js
