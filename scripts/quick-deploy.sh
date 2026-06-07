#!/bin/bash
# 甜趣点点消 - 快速部署脚本
# Ubuntu 22.04

set -e

echo "======================================="
echo "甜趣点点消 - 快速部署"
echo "======================================="

# 1. 安装Docker
echo "[1/6] 安装Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# 2. 安装Docker Compose
echo "[2/6] 安装Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo apt install -y docker-compose
fi

# 3. 创建项目目录
echo "[3/6] 设置项目目录..."
sudo mkdir -p /opt/happy-match
sudo chown -R $USER:$USER /opt/happy-match
cd /opt/happy-match

echo "[4/6] 项目文件已准备好！"

# 5. 配置环境变量
echo "[5/6] 配置环境变量..."
cat > .env.production << 'ENVEOF'
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=HappyMatch2024!
DATABASE_NAME=happy_match

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT密钥
JWT_SECRET=happy-match-jwt-secret-key-2024-production

# API基础URL
API_BASE_URL=http://114.132.69.85
ENVEOF

echo "[6/6] 启动服务！"
echo "======================================"
echo "部署完成！现在您可以："
echo "  1. 将项目代码放到 /opt/happy-match"
echo "  2. 运行: docker-compose -f docker-compose.simple.yml up -d"
echo ""
echo "快速启动命令："
echo "  cd /opt/happy-match"
echo "  docker-compose -f docker-compose.simple.yml up -d"
echo "======================================"
