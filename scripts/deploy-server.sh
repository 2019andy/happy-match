#!/bin/bash
# 服务器端部署脚本 - 在114.132.69.85上直接执行
# 执行方式: bash scripts/deploy-server.sh

set -e

echo ""
echo "=========================================="
echo "  甜趣点点消 v2.0.0 - 服务器部署"
echo "=========================================="
echo ""
echo "📌 服务器信息"
echo "   - 主机名: $(hostname)"
echo "   - 当前时间: $(date)"
echo "   - 工作目录: /opt/happy-match"
echo ""

# 步骤1: 进入项目目录
echo "[1/6] 进入项目目录..."
cd /opt/happy-match || {
    echo "❌ 错误: 无法进入 /opt/happy-match 目录"
    echo "尝试创建目录..."
    mkdir -p /opt/happy-match
    cd /opt/happy-match
}
echo "✅ 完成"

# 步骤2: 拉取最新代码
echo ""
echo "[2/6] 从Git拉取最新代码..."
if [ -d ".git" ]; then
    echo "  - Git仓库存在，切换到main分支..."
    git checkout main 2>/dev/null || git checkout -b main
    
    echo "  - 拉取最新代码..."
    git pull origin main 2>&1 | tail -5
    
    echo "  - 检查最新提交..."
    git log --oneline -3
else
    echo "  - Git仓库不存在，尝试克隆..."
    git clone https://github.com/2019andy/happy-match.git .
fi
echo "✅ 完成"

# 步骤3: 停止旧服务
echo ""
echo "[3/6] 停止旧服务..."
OLD_COUNT=$(ps aux | grep -E '(tsx|node)' | grep -v grep | wc -l)
echo "  - 检测到 ${OLD_COUNT} 个Node.js进程"

if [ "$OLD_COUNT" -gt "0" ]; then
    pkill -f 'tsx api/server.ts' 2>/dev/null || true
    pkill -f 'node' 2>/dev/null || true
    sleep 2
    echo "  - 已停止所有Node.js进程"
else
    echo "  - 未检测到运行中的服务"
fi
echo "✅ 完成"

# 步骤4: 安装依赖
echo ""
echo "[4/6] 检查并安装依赖..."

# Node.js检查
if ! command -v node &> /dev/null; then
    echo "  - 安装Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi
echo "  - Node.js: $(node --version 2>/dev/null || echo '未安装')"
echo "  - npm: $(npm --version 2>/dev/null || echo '未安装')"

# tsx检查
if ! npx tsx --version 2>/dev/null | grep -q "."; then
    echo "  - 安装tsx..."
    npm install -g tsx 2>&1 | tail -3
fi
echo "  - tsx: $(npx tsx --version 2>/dev/null || echo '未安装')"

# 项目依赖
if [ -f "package.json" ]; then
    echo "  - 安装项目依赖..."
    npm install 2>&1 | tail -5 || echo "  ⚠️ npm install 完成（可能有警告）"
fi
echo "✅ 完成"

# 步骤5: 启动API服务
echo ""
echo "[5/6] 启动API服务..."
mkdir -p /var/log/happy-match

# 确保在正确目录
cd /opt/happy-match

# 启动服务
nohup npx tsx api/server.ts > /var/log/happy-match/api-server.log 2>&1 &
SERVICE_PID=$!
echo "  - 服务PID: $SERVICE_PID"
echo "  - 日志文件: /var/log/happy-match/api-server.log"
sleep 5
echo "✅ 完成"

# 步骤6: 验证部署
echo ""
echo "[6/6] 验证部署状态..."
echo ""
echo "  [1/3] 检查进程..."
ps aux | grep -E '(tsx|node)' | grep -v grep || echo "  ⚠️ 未检测到进程"

echo ""
echo "  [2/3] 检查端口..."
PORT_CHECK=$(netstat -tlnp 2>/dev/null | grep 3001 || ss -tlnp | grep 3001 || echo "  ⚠️ 端口3001未检测到监听")
echo "  $PORT_CHECK"

echo ""
echo "  [3/3] 测试API响应..."
sleep 3
API_RESPONSE=$(curl -s --connect-timeout 10 http://localhost:3001/api/admin/users 2>&1 | head -100 || echo "  ⚠️ API请求超时或失败")
echo "  - API响应: $API_RESPONSE"

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "📌 服务信息"
echo "   - PID: $SERVICE_PID"
echo "   - 外部访问: http://114.132.69.85:3001"
echo "   - 本地访问: http://localhost:3001"
echo "   - 管理后台: http://114.132.69.85:3001/admin"
echo ""
echo "📌 API接口测试"
echo "   - 获取用户: curl http://114.132.69.85:3001/api/admin/users"
echo "   - 获取关卡: curl http://114.132.69.85:3001/api/admin/levels"
echo "   - 缓存统计: curl http://114.132.69.85:3001/api/admin/cache/stats"
echo ""
echo "📌 日志查看"
echo "   - 实时日志: tail -f /var/log/happy-match/api-server.log"
echo "   - 最近日志: tail -100 /var/log/happy-match/api-server.log"
echo ""
echo "📌 服务管理"
echo "   - 查看状态: ps aux | grep -E '(tsx|node)' | grep -v grep"
echo "   - 停止服务: pkill -f 'tsx api/server.ts'"
echo "   - 重启服务: bash /opt/happy-match/scripts/deploy-server.sh"
echo ""
echo "=========================================="

# 自动打开日志（可选项）
echo ""
read -p "是否查看启动日志? [y/N]: " -t 10 -n 1 choice || true
if [[ "$choice" =~ ^[Yy]$ ]]; then
    echo ""
    echo "启动日志 (最近50行):"
    echo "----------------------------------------"
    tail -50 /var/log/happy-match/api-server.log
    echo "----------------------------------------"
fi
