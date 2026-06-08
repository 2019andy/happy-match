#!/bin/bash

# 甜趣点点消 - v2.0.0 服务器部署脚本
# 功能：
#   1. 连接到远程服务器 114.132.69.85
#   2. 从Git拉取最新代码 (main分支)
#   3. 停止旧服务
#   4. 启动新API服务
#   5. 验证部署状态

set -e

SERVER_IP="114.132.69.85"
SERVER_USER="root"
SERVER_PASS="Ubuntu123"

echo "=========================================="
echo "甜趣点点消 - 服务器部署 v2.0.0"
echo "=========================================="
echo ""
echo "[INFO] 目标服务器: $SERVER_IP"
echo "[INFO] 部署用户: $SERVER_USER"
echo ""

# 创建远程执行脚本
REMOTE_SCRIPT=$(cat << 'REMOTEEOF'
#!/bin/bash
set -e

echo ""
echo "=========================================="
echo "[服务器端] 开始部署..."
echo "=========================================="

# 1. 进入项目目录
echo ""
echo "[1/7] 检查项目目录..."
if [ -d "/opt/happy-match" ]; then
    cd /opt/happy-match
    echo "✅ 项目目录存在: /opt/happy-match"
    ls -la
else
    echo "❌ 项目目录不存在，尝试从GitHub克隆..."
    mkdir -p /opt/happy-match
    cd /opt/happy-match
    git clone https://github.com/2019andy/happy-match.git . || {
        echo "❌ Git克隆失败，检查网络连接或仓库权限"
        exit 1
    }
fi

# 2. 检查Git状态
echo ""
echo "[2/7] 检查Git状态..."
if command -v git &> /dev/null; then
    git status
    echo "✅ Git已安装"
else
    echo "❌ Git未安装"
    exit 1
fi

# 3. 拉取最新代码
echo ""
echo "[3/7] 拉取最新代码 (main分支)..."
git checkout main || git checkout -b main
git pull origin main || {
    echo "⚠️  Pull失败，尝试重置后重新拉取..."
    git reset --hard HEAD
    git clean -fd
    git pull origin main
}

echo "✅ 代码已更新到最新版本"

# 4. 检查最新提交
echo ""
echo "[4/7] 最新Git提交..."
git log --oneline -5

# 5. 停止旧服务
echo ""
echo "[5/7] 停止旧服务..."
pkill -f 'tsx api/server.ts' 2>/dev/null || echo "  - 无tsx进程"
pkill -f 'node.*api' 2>/dev/null || echo "  - 无node进程"
sleep 2
echo "✅ 旧服务已停止"

# 6. 安装依赖（如需要）
echo ""
echo "[6/7] 检查并安装依赖..."

# 检查node
if ! command -v node &> /dev/null; then
    echo "  - 安装Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

NODE_VERSION=$(node --version 2>/dev/null || echo "未安装")
echo "  - Node.js版本: $NODE_VERSION"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "  - 安装npm..."
    apt-get install -y npm
fi

NPM_VERSION=$(npm --version 2>/dev/null || echo "未安装")
echo "  - npm版本: $NPM_VERSION"

# 检查tsx
if ! npm list -g tsx 2>/dev/null | grep -q "tsx"; then
    echo "  - 安装tsx..."
    npm install -g tsx
fi

TSX_VERSION=$(npx tsx --version 2>/dev/null || echo "未安装")
echo "  - tsx版本: $TSX_VERSION"

# 安装项目依赖
if [ -f "package.json" ]; then
    echo "  - 安装项目依赖..."
    npm install 2>&1 | tail -5 || echo "  ⚠️ npm install完成（可能有警告）"
    echo "  ✅ 项目依赖安装完成"
fi

# 7. 启动API服务
echo ""
echo "[7/7] 启动API服务 (端口: 3001)..."

# 创建日志目录
mkdir -p /var/log/happy-match

# 停止现有进程并启动新服务
pkill -9 -f 'api/server.ts' 2>/dev/null || true
pkill -9 -f 'tsx' 2>/dev/null || true
sleep 2

cd /opt/happy-match
nohup npx tsx api/server.ts > /var/log/happy-match/api-server.log 2>&1 &
SERVICE_PID=$!

sleep 5

echo "  ✅ API服务已启动 (PID: $SERVICE_PID)"

# 验证部署
echo ""
echo "=========================================="
echo "[验证] 检查服务状态..."
echo "=========================================="

# 检查进程
echo ""
echo "[1/3] 检查运行进程..."
ps aux | grep -E '(tsx|node)' | grep -v grep || echo "  ⚠️ 未检测到进程"

# 检查端口
echo ""
echo "[2/3] 检查端口占用..."
netstat -tlnp 2>/dev/null | grep 3001 || ss -tlnp | grep 3001 || echo "  ⚠️ 端口3001未检测到监听"

# 测试API
echo ""
echo "[3/3] 测试API响应..."
sleep 3
API_RESPONSE=$(curl -s http://localhost:3001/api/admin/users 2>&1 | head -100 || echo "  ⚠️ API请求失败")
echo "  - API响应状态: $?"
echo "  - API响应内容: $API_RESPONSE"

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📌 服务信息："
echo "   - API服务PID: $SERVICE_PID"
echo "   - API地址: http://$SERVER_IP:3001"
echo "   - 管理后台: http://$SERVER_IP:3001/admin"
echo ""
echo "📌 日志路径："
echo "   - /var/log/happy-match/api-server.log"
echo ""
echo "📌 常用命令："
echo "   - 查看日志: tail -f /var/log/happy-match/api-server.log"
echo "   - 停止服务: pkill -f 'tsx api/server.ts'"
echo "   - 启动服务: cd /opt/happy-match && nohup npx tsx api/server.ts > /var/log/happy-match/api-server.log 2>&1 &"
echo "   - 检查状态: curl http://$SERVER_IP:3001/api/admin/users"
echo ""
echo "=========================================="

REMOTEEOF
)

# 保存远程脚本
echo "$REMOTE_SCRIPT" > /tmp/deploy-remote.sh
chmod +x /tmp/deploy-remote.sh

# 检查sshpass
echo "[准备] 检查部署工具..."
if ! command -v sshpass &> /dev/null; then
    echo "  - 安装sshpass..."
    if command -v brew &> /dev/null; then
        brew install sshpass 2>&1 | tail -3 || echo "  ⚠️ 使用expect替代方案"
    fi
fi

echo "  ✅ 准备完成"
echo ""

# 方法1: 如果有sshpass，使用它
if command -v sshpass &> /dev/null; then
    echo "[执行] 使用sshpass远程部署..."
    
    # 上传脚本到服务器
    sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no \
        /tmp/deploy-remote.sh \
        "$SERVER_USER@$SERVER_IP:/tmp/deploy-remote.sh"
    
    # 远程执行脚本
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no \
        "$SERVER_USER@$SERVER_IP" \
        "chmod +x /tmp/deploy-remote.sh && bash /tmp/deploy-remote.sh"

# 方法2: 否则使用expect
else
    echo "[执行] 使用expect远程部署..."
    
    EXPECT_SCRIPT=$(cat << 'EXPEOF'
#!/usr/bin/expect -f
set timeout 600

set SERVER_IP "114.132.69.85"
set SERVER_USER "root"
set SERVER_PASS "Ubuntu123"

puts "\n连接到服务器...\n"

spawn scp -o StrictHostKeyChecking=no /tmp/deploy-remote.sh $SERVER_USER@$SERVER_IP:/tmp/deploy-remote.sh
expect {
    "password:" {
        send "$SERVER_PASS\r"
    }
    "Are you sure" {
        send "yes\r"
        exp_continue
    }
}
expect eof

puts "\n上传完成，开始执行部署...\n"

spawn ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "chmod +x /tmp/deploy-remote.sh && bash /tmp/deploy-remote.sh"
expect {
    "password:" {
        send "$SERVER_PASS\r"
    }
    "Are you sure" {
        send "yes\r"
        exp_continue
    }
}
expect eof
EXPEOF
)

    echo "$EXPECT_SCRIPT" > /tmp/deploy-expect.exp
    chmod +x /tmp/deploy-expect.exp
    
    if ! command -v expect &> /dev/null; then
        echo "  - 安装expect..."
        if command -v brew &> /dev/null; then
            brew install expect
        fi
    fi
    
    expect /tmp/deploy-expect.exp
fi

echo ""
echo "=========================================="
echo "✅ 远程部署流程已完成"
echo "=========================================="
echo ""
echo "请检查上方的服务器输出以确认部署状态"
echo ""
echo "📌 验证命令："
echo "   curl http://114.132.69.85:3001/api/admin/users"
echo ""
