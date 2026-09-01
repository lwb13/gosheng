#!/usr/bin/env bash
# ================================================================
# Go神 Steam 绑定后端 — Ubuntu 22.04 一键部署脚本
#
# 用法（在服务器上，以 root 运行）：
#   1. 把 server/ 目录上传到服务器，如 /root/gosheng
#   2. cd /root/gosheng/server
#   3. 编辑 .env，填入 STEAM_API_KEY / JWT_SECRET / BASE_URL / APP_SCHEME
#   4. bash deploy.sh
#
# 会安装：Node.js 20、PM2、Caddy（自动 HTTPS）
# ================================================================
set -e

echo "===== [1/5] 安装 Node.js 20 ====="
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node 版本: $(node -v)"

echo "===== [2/5] 安装 PM2 ====="
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

echo "===== [3/5] 安装 Caddy（自动 HTTPS 反向代理） ====="
if ! command -v caddy >/dev/null 2>&1; then
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update
  apt-get install -y caddy
fi

echo "===== [4/5] 安装依赖并启动 Node 服务 ====="
cd "$(dirname "$0")"
npm install --production
pm2 delete gosheng-server 2>/dev/null || true
pm2 start src/index.js --name gosheng-server
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo "===== [5/5] 配置 Caddy 反向代理 ====="
# 从 .env 读取域名（去掉 https:// 前缀）
DOMAIN=$(grep '^BASE_URL=' .env | cut -d= -f2 | sed -e 's#https\?://##' -e 's#/$##')
if [ -z "$DOMAIN" ]; then
  echo "⚠️  未在 .env 找到 BASE_URL，请手动配置 /etc/caddy/Caddyfile"
else
  cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
    reverse_proxy localhost:3000
}
EOF
  systemctl reload caddy
  echo "Caddy 已配置：$DOMAIN -> localhost:3000"
fi

echo ""
echo "===== ✅ 部署完成 ====="
echo "健康检查: https://$DOMAIN/api/health"
echo "登录入口: https://$DOMAIN/api/auth/steam"
echo ""
echo "查看日志: pm2 logs gosheng-server"
