# 甜趣点点消 v2.0.0 部署指南

## 🎯 部署目标
- 服务器: 114.132.69.85
- 用户名: root
- 部署版本: v2.0.0
- 服务端口: 3001 (API服务)

## 📋 前置要求

### 1. 本地环境
```bash
# macOS用户
brew install sshpass expect

# 或使用SSH密钥（推荐）
# 如果您已经配置了SSH密钥，跳过密码输入步骤
```

### 2. 检查SSH连接
```bash
# 测试SSH连接
ssh root@114.132.69.85 "echo 'SSH连接成功'"

# 如果需要密码，输入一次后测试
# 推荐配置SSH密钥免密码登录
```

---

## 🚀 快速部署方案（推荐）

### 方案一：手动执行远程命令（最可靠）

```bash
# 步骤1: 连接到服务器
ssh root@114.132.69.85

# 步骤2: 在服务器上执行以下命令（复制粘贴整个脚本）
cd /opt/happy-match

# 步骤3: 拉取最新代码
git checkout main
git pull origin main

# 步骤4: 检查状态
git status
git log --oneline -5

# 步骤5: 停止旧服务
pkill -f 'tsx api/server.ts' 2>/dev/null
sleep 2

# 步骤6: 安装依赖（首次或有更新时执行）
cd /opt/happy-match
npm install 2>&1 | tail -10

# 步骤7: 启动新服务
mkdir -p /var/log/happy-match
cd /opt/happy-match
nohup npx tsx api/server.ts > /var/log/happy-match/api-server.log 2>&1 &

# 步骤8: 等待并验证
sleep 5

# 检查进程
ps aux | grep -E '(tsx|node)' | grep -v grep

# 检查端口
netstat -tlnp 2>/dev/null | grep 3001 || ss -tlnp | grep 3001

# 测试API
curl -s http://localhost:3001/api/admin/users | head -100

# 查看日志
tail -50 /var/log/happy-match/api-server.log

# 步骤9: 退出服务器
exit
```

### 方案二：使用部署脚本（推荐给技术人员）

```bash
# 步骤1: 进入项目目录
cd /Users/mac/Documents/trae_projects/happy-match

# 步骤2: 确保脚本有执行权限
chmod +x scripts/deploy-server.sh

# 步骤3: 执行部署（会提示输入密码）
bash scripts/deploy-server.sh
```

### 方案三：分步部署脚本（最灵活）

项目已包含以下脚本：
- `scripts/deploy-step1-connect.sh` - 连接并检查状态
- `scripts/deploy-step2-pull.sh` - 拉取最新代码
- `scripts/deploy-step3-restart.sh` - 重启服务
- `scripts/verify-deploy.sh` - 验证部署状态

---

## 📝 服务器部署脚本（一键执行）

在服务器 `/opt/happy-match` 目录下执行以下完整脚本：

```bash
#!/bin/bash
set -e

echo "=========================================="
echo "甜趣点点消 v2.0.0 - 服务器部署"
echo "=========================================="

# 进入项目目录
cd /opt/happy-match
echo ""
echo "[1/6] 位置: $(pwd)"
ls -la

# 拉取最新代码
echo ""
echo "[2/6] 拉取最新代码..."
git checkout main
git pull origin main

echo ""
echo "[3/6] Git状态..."
git status
git log --oneline -5

# 停止旧服务
echo ""
echo "[4/6] 停止旧服务..."
pkill -f 'tsx api/server.ts' 2>/dev/null || true
pkill -f 'node' 2>/dev/null || true
sleep 2
echo "✅ 旧服务已停止"

# 安装依赖
echo ""
echo "[5/6] 检查并安装依赖..."
if [ -f "package.json" ]; then
    echo "  - 安装项目依赖..."
    npm install 2>&1 | tail -5 || echo "  ⚠️ npm install 完成"
fi

# 安装全局工具
npm list -g tsx 2>/dev/null | grep -q "tsx" || npm install -g tsx

echo "✅ 依赖安装完成"

# 启动新服务
echo ""
echo "[6/6] 启动API服务..."
mkdir -p /var/log/happy-match
cd /opt/happy-match
nohup npx tsx api/server.ts > /var/log/happy-match/api-server.log 2>&1 &
SERVICE_PID=$!
echo "  - PID: $SERVICE_PID"
sleep 5

echo ""
echo "=========================================="
echo "[验证] 检查服务状态"
echo "=========================================="

echo ""
echo "[1/3] 进程检查..."
ps aux | grep -E '(tsx|node)' | grep -v grep || echo "  ⚠️ 未检测到进程"

echo ""
echo "[2/3] 端口检查..."
netstat -tlnp 2>/dev/null | grep 3001 || ss -tlnp | grep 3001 || echo "  ⚠️ 端口3001未监听"

echo ""
echo "[3/3] API测试..."
sleep 3
echo "  - 测试: GET /api/admin/users"
curl -s http://localhost:3001/api/admin/users 2>&1 | head -50 || echo "  ⚠️ API请求失败"

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📌 服务信息"
echo "   - PID: $SERVICE_PID"
echo "   - 访问地址: http://114.132.69.85:3001"
echo "   - 管理后台: http://114.132.69.85:3001/admin"
echo ""
echo "📌 日志文件"
echo "   - tail -f /var/log/happy-match/api-server.log"
echo ""
echo "📌 常用命令"
echo "   - 查看状态: ps aux | grep tsx"
echo "   - 停止服务: pkill -f 'tsx api/server.ts'"
echo "   - 重启服务: bash /opt/happy-match/scripts/deploy-server.sh"
echo "   - 查看日志: tail -f /var/log/happy-match/api-server.log"
echo ""
echo "=========================================="
```

---

## 🔧 部署脚本文件

项目中包含以下部署脚本（位于 `/scripts` 目录）：

### 1. deploy-server.sh - 完整部署
自动拉取代码、安装依赖、重启服务

### 2. deploy-step1-connect.sh - 仅连接测试
测试SSH连接和服务器状态

### 3. deploy-step2-pull.sh - 仅拉取代码
从GitHub拉取最新代码

### 4. deploy-step3-restart.sh - 仅重启服务
停止旧服务并启动新服务

### 5. verify-deploy.sh - 验证部署
检查服务状态和API响应

---

## ⚠️ 常见问题

### Q1: SSH连接失败？
```bash
# 检查SSH密钥
ls -la ~/.ssh/

# 或使用密码连接
ssh root@114.132.69.85
```

### Q2: 服务启动失败？
```bash
# 检查日志
tail -100 /var/log/happy-match/api-server.log

# 检查Node.js
node --version
npm --version
npx tsx --version

# 检查端口占用
netstat -tlnp | grep 3001
```

### Q3: 如何手动重启？
```bash
# 停止
pkill -f 'tsx api/server.ts'
sleep 2

# 启动
cd /opt/happy-match
nohup npx tsx api/server.ts > /var/log/happy-match/api-server.log 2>&1 &

# 验证
sleep 3
curl -s http://localhost:3001/api/admin/users | head -50
```

### Q4: 端口冲突？
```bash
# 检查占用
lsof -i :3001 || netstat -tlnp | grep 3001

# 杀死占用进程
kill -9 <PID>

# 重新启动
```

---

## ✅ 部署验证清单

部署完成后，请验证以下项目：

- [ ] Git代码已拉取到最新
- [ ] 最新提交哈希匹配本地版本
- [ ] Node.js进程正在运行
- [ ] 端口3001正在监听
- [ ] API `/api/admin/users` 可以访问
- [ ] 日志文件存在且无严重错误

---

## 📞 需要帮助？

如果部署遇到问题，请提供以下信息：
1. SSH连接状态
2. Git pull的输出
3. 服务启动日志 `/var/log/happy-match/api-server.log`
4. 端口检查结果
5. curl测试API的响应
