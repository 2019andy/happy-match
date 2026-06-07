#!/bin/bash
# 甜趣点点消 - 完整部署脚本
# Ubuntu 22.04 或 Ubuntu 24.04

set -e

echo "=========================================="
echo "甜趣点点消 - 开始部署"
echo "=========================================="

# 1. 更新系统
echo "[1/8] 更新系统..."
sudo apt update && sudo apt upgrade -y

# 2. 安装所需依赖
echo "[2/8] 安装 Docker 和 Docker Compose..."
sudo apt install -y docker.io docker-compose git

# 3. 启动并启用 Docker
echo "[3/8] 配置 Docker..."
sudo systemctl start docker
sudo systemctl enable docker

# 4. 创建项目目录
echo "[4/8] 创建项目目录..."
sudo mkdir -p /opt/happy-match
sudo chown -R $USER:$USER /opt/happy-match
cd /opt/happy-match

# 5. 克隆项目代码
echo "[5/8] 克隆项目代码..."
if [ -d ".git" ]; then
    echo "项目已存在，更新中..."
    git pull origin main
else
    echo "克隆新项目..."
    git clone https://github.com/2019andy/happy-match.git .
fi

# 6. 配置环境变量
echo "[6/8] 配置环境变量..."
cat > .env.production << 'ENVEOF'
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=HappyMatch2024!
DATABASE_NAME=happy_match

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT 密钥
JWT_SECRET=happy-match-jwt-secret-key-2024-production

# API 基础 URL
API_BASE_URL=http://114.132.69.85

# 微信小程序配置（稍后配置）
WECHAT_APPID=your-wechat-appid
WECHAT_SECRET=your-wechat-secret

# 优量汇广告配置（稍后配置）
AD_SDK_APPID=your-ad-sdk-appid
AD_SDK_SECRET=your-ad-sdk-secret
ENVEOF

# 7. 安装 MySQL（如未安装）
echo "[7/8] 配置 MySQL 数据库..."
if ! command -v mysql &> /dev/null; then
    echo "安装 MySQL..."
    sudo apt install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
fi

# 初始化数据库
echo "初始化数据库..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS happy_match CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || true
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'HappyMatch2024!';" || true
sudo mysql -e "FLUSH PRIVILEGES;" || true

# 8. 启动服务
echo "[8/8] 启动项目服务..."
if [ -f "docker-compose.yml" ]; then
    echo "使用 Docker Compose 启动..."
    sudo docker-compose up -d --build
elif [ -f "docker-compose.simple.yml" ]; then
    echo "使用简化 Docker Compose 配置..."
    sudo docker-compose -f docker-compose.simple.yml up -d --build
else
    echo "未找到 docker-compose.yml，创建简单启动脚本..."
    echo "项目已克隆到 /opt/happy-match"
    echo "请手动配置和启动服务"
fi

echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo "项目地址：http://114.132.69.85"
echo "项目目录：/opt/happy-match"
echo "查看服务状态：cd /opt/happy-match && sudo docker-compose ps"
echo "查看日志：cd /opt/happy-match && sudo docker-compose logs -f"
echo ""
echo "后续操作："
echo "1. 配置微信小程序 AppID 和 Secret"
echo "2. 配置优量汇广告 SDK"
echo "3. 配置域名和 SSL 证书（可选但推荐）"
