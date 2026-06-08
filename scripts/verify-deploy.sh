#!/bin/bash
# 验证部署状态 - 在服务器上或本地执行
# 执行方式: bash scripts/verify-deploy.sh

echo ""
echo "=========================================="
echo "  部署验证工具"
echo "=========================================="
echo ""

echo "[1/5] 系统信息"
echo "----------------------------------------"
echo "  - 主机名: $(hostname)"
echo "  - 系统: $(uname -a)"
echo "  - 时间: $(date)"
echo ""

echo "[2/5] 进程状态"
echo "----------------------------------------"
PROCESS=$(ps aux | grep -E '(tsx|node)' | grep -v grep || echo "  ⚠️ 未检测到Node.js进程"
echo "$PROCESS"
echo ""

echo "[3/5] 端口状态"
echo "----------------------------------------"
PORT=$(netstat -tlnp 2>/dev/null | grep -E '(3001|80|443)' || ss -tlnp | grep -E '(3001|80|443)' || echo "  ⚠️ 未检测到监听端口"
echo "$PORT"
echo ""

echo "[4/5] API测试"
echo "----------------------------------------"
echo "  - 测试用户接口..."
curl -s --connect-timeout 5 http://localhost:3001/api/admin/users 2>&1 | head -30 || echo "  ⚠️ API请求失败"
echo ""

echo "  - 测试缓存统计..."
curl -s --connect-timeout 5 http://localhost:3001/api/admin/cache/stats 2>&1 | head -30 || echo "  ⚠️ API请求失败"
echo ""

echo "[5/5] 日志检查"
echo "----------------------------------------"
if [ -f "/var/log/happy-match/api-server.log" ]; then
    echo "  - 日志存在: /var/log/happy-match/api-server.log"
    echo "  - 最近10行日志:"
    echo "  ----------------------------------------"
    tail -10 /var/log/happy-match/api-server.log 2>&1
    echo "  ----------------------------------------"
else
    echo "  ⚠️ 未找到日志文件"
fi

echo ""
echo "=========================================="
echo "  验证完成"
echo "=========================================="
echo ""
echo "📌 常用命令"
echo "   - 查看日志: tail -f /var/log/happy-match/api-server.log"
echo "   - 重启服务: bash /opt/happy-match/scripts/deploy-server.sh"
echo "   - 测试API: curl http://localhost:3001/api/admin/users"
echo ""
