#!/bin/bash

# 甜趣点点消 - 服务器完整部署脚本
# 在Ubuntu 22.04上执行

set -e

echo "=========================================="
echo "甜趣点点消 - 服务器部署"
echo "=========================================="

# 1. 更新系统
echo "[步骤 1/8] 更新系统..."
sudo apt update && sudo apt upgrade -y

# 2. 安装必要工具
echo "[步骤 2/8] 安装必要工具..."
sudo apt install -y git curl wget software-properties-common

# 3. 安装Docker
echo "[步骤 3/8] 安装Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 4. 安装MySQL（可选，也可以用Docker）
echo "[步骤 4/8] 安装MySQL..."
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# 5. 创建项目目录
echo "[步骤 5/8] 设置项目..."
sudo mkdir -p /opt/happy-match
sudo chown $USER:$USER /opt/happy-match
cd /opt/happy-match

# 6. 克隆代码
echo "[步骤 6/8] 克隆GitHub代码..."
git clone https://github.com/2019andy/happy-match.git .
git checkout main

# 7. 配置环境变量
echo "[步骤 7/8] 配置环境..."
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

# 微信小程序配置
WECHAT_APPID=your-wechat-appid
WECHAT_SECRET=your-wechat-secret

# 优量汇广告配置
AD_SDK_APPID=your-ad-sdk-appid
AD_SDK_SECRET=your-ad-sdk-secret
ENVEOF

# 8. 初始化数据库
echo "[步骤 8/8] 初始化数据库..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS happy_match CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'HappyMatch2024!';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo "=========================================="
echo "基础配置完成！"
echo "=========================================="
echo ""
echo "接下来执行Docker部署："
echo "  cd /opt/happy-match"
echo "  docker compose -f docker-compose.yml up -d"
echo ""
echo "或者运行完整部署（包含Docker构建）："
echo "  bash scripts/deploy.sh"
