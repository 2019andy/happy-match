#!/bin/bash
# 重启服务脚本 - 在服务器上执行
# 执行方式: bash scripts/restart-server.sh

echo ""
echo "=========================================="
echo "  重启API服务"
echo "=========================================="
echo ""

# 步骤1: 停止旧服务
echo "[1/3] 停止旧服务..."
OLD_COUNT=$(ps aux | grep -E '(tsx|node)' | grep -v grep | wc -l)
echo "  - 检测到 ${OLD_COUNT} 个进程"

if [ "$OLD_COUNT" -gt "0" ]; then
    pkill -f 'tsx api/server.ts' 2>/dev/null || true
    pkill -f 'node' 2>/dev/null || true
    sleep 2
    echo "  ✅ 已停止所有服务"
else
    echo "  ℹ️  未检测到运行中的服务"
fi

# 步骤2: 启动新服务
echo ""
echo "[2/3] 启动新服务..."
cd /opt/happy-match
mkdir -p /var/log/happy-match

nohup npx tsx api/server.ts > /var/log/happy-match/api-server.log 2>&1 &
SERVICE_PID=$!
echo "  - PID: $SERVICE_PID"
echo "  - 日志: /var/log/happy-match/api-server.log"
sleep 5

# 步骤3: 验证
echo ""
echo "[3/3] 验证服务..."
PROCESS=$(ps aux | grep -E '(tsx|node)' | grep -v grep || echo "  ⚠️ 未检测到进程")
echo "  - 进程状态: $PROCESS"

echo ""
echo "=========================================="
echo "  ✅ 重启完成"
echo "=========================================="
echo ""
echo "📌 服务信息"
echo "   - PID: $SERVICE_PID"
echo "   - 地址: http://114.132.69.85:3001"
echo ""
echo "📌 验证方法"
echo "   - curl http://localhost:3001/api/admin/users"
echo "   - tail -f /var/log/happy-match/api-server.log"
echo ""
