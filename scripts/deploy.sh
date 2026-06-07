#!/bin/bash

# 甜趣点点消 - 服务器部署脚本
# 适用于Ubuntu 22.04

set -e

echo "=========================================="
echo "甜趣点点消 - 服务器部署脚本"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 服务器配置
SERVER_IP="114.132.69.85"
SERVER_USER="root"
SERVER_PASS="Ubuntu123"

echo -e "${YELLOW}目标服务器: $SERVER_IP${NC}"

# 安装expect用于非交互式SSH
echo -e "${GREEN}[1/6] 安装必要软件...${NC}"
apt update && apt install -y expect openssl

# 测试SSH连接
echo -e "${GREEN}[2/6] 测试SSH连接...${NC}"
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo 'SSH连接成功'" || {
    echo -e "${RED}SSH连接失败，请检查密码和服务器状态${NC}"
    exit 1
}

# 执行远程部署命令
echo -e "${GREEN}[3/6] 在服务器上执行部署...${NC}"

sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

echo "=========================================="
echo "开始配置服务器"
echo "=========================================="

# 更新系统
echo "[1/8] 更新系统..."
apt update && apt upgrade -y

# 安装Docker
echo "[2/8] 安装Docker..."
apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动Docker
systemctl start docker
systemctl enable docker

# 安装Git
echo "[3/8] 安装Git..."
apt install -y git

# 创建项目目录
echo "[4/8] 创建项目目录..."
mkdir -p /opt/happy-match
cd /opt/happy-match

# 克隆代码
echo "[5/8] 克隆代码..."
git clone https://github.com/2019andy/happy-match.git .
git checkout main

# 配置环境变量
echo "[6/8] 配置环境变量..."
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

# 安装MySQL
echo "[7/8] 安装MySQL..."
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

# 创建数据库
mysql -e "CREATE DATABASE IF NOT EXISTS happy_match CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'HappyMatch2024!';"
mysql -e "FLUSH PRIVILEGES;"

# 拉取并构建Docker镜像
echo "[8/8] 构建并启动服务..."
docker compose -f docker-compose.yml down 2>/dev/null || true
docker compose -f docker-compose.yml build --no-cache
docker compose -f docker-compose.yml up -d

# 查看服务状态
sleep 5
docker compose -f docker-compose.yml ps

echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo "前端地址: http://$SERVER_IP"
echo "后端API: http://$SERVER_IP/api"
echo "管理后台: http://$SERVER_IP/admin"
echo ""
echo "查看日志: docker compose -f /opt/happy-match/docker-compose.yml logs -f"
echo "重启服务: docker compose -f /opt/happy-match/docker-compose.yml restart"
ENDSSH

echo -e "${GREEN}部署脚本执行完成！${NC}"
echo ""
echo -e "${YELLOW}请在浏览器中访问：${NC}"
echo -e "  - 前端: http://$SERVER_IP"
echo -e "  - 管理后台: http://$SERVER_IP/admin"
echo ""
echo -e "${YELLOW}后续步骤：${NC}"
echo "1. 配置微信小程序AppID和Secret"
echo "2. 配置优量汇广告SDK"
echo "3. 配置SSL证书（可选但推荐）"
