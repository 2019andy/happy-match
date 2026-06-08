# Git 操作记录与回滚指南

## 📋 当前提交记录

### 最新提交
```
提交哈希: [提交哈希]
标签: v2.0.0
分支: main, backup-v2.0.0
提交信息: feat: 完整的后台管理系统用户管理功能

主要变更:
1. 用户管理CRUD操作（编辑、逻辑删除、添加）
2. 缓存管理系统（数据库→缓存→页面）
3. 后端API完善（用户管理、缓存管理、管理员认证）
```

### 提交历史
```bash
# 查看完整提交历史
git log --oneline --graph --all

# 查看特定提交详情
git show [提交哈希]
```

## 🔄 回滚方法

### 方法1: 回滚到上一个版本（保留更改）
```bash
# 查看提交历史
git log --oneline -5

# 撤销上一次提交（保留工作区更改）
git revert HEAD

# 推送到远程
git push origin main
```

### 方法2: 强制回滚到指定提交
```bash
# 回滚到 v2.0.0 标签
git checkout v2.0.0

# 创建新分支基于该版本
git checkout -b rollback-branch v2.0.0

# 或者直接重置 main 分支
git reset --hard v2.0.0
git push origin main --force
```

### 方法3: 使用备份分支
```bash
# 切换到备份分支
git checkout backup-v2.0.0

# 合并到 main
git checkout main
git merge backup-v2.0.0

# 推送
git push origin main
```

## 🚀 部署命令

### 拉取最新代码
```bash
# 切换到 main 分支
git checkout main

# 拉取最新代码
git pull origin main

# 如果有标签更新
git fetch --tags
```

### 查看可用标签
```bash
# 列出所有标签
git tag -l

# 查看标签详情
git show v2.0.0
```

### 部署到生产环境
```bash
# 方式1: 使用标签部署
git checkout v2.0.0
npm install
npm run build

# 方式2: 使用 main 分支
git checkout main
git pull origin main
npm install
npm run build
```

## 📊 Git 状态检查

### 查看当前状态
```bash
# 查看工作区状态
git status

# 查看文件变更统计
git diff --stat

# 查看分支信息
git branch -vv
```

### 查看远程仓库信息
```bash
# 查看远程仓库
git remote -v

# 查看所有分支
git branch -a

# 查看标签
git tag -l
```

## ⚠️ 紧急回滚流程

如果发现代码错误需要立即回滚:

1. **识别问题**: 确定需要回滚到哪个版本
2. **创建备份**: 在回滚前创建当前版本的备份分支
   ```bash
   git branch backup-before-rollback
   ```
3. **执行回滚**: 使用上述方法之一回滚代码
4. **验证**: 检查应用是否正常工作
5. **通知**: 如果是生产环境，通知相关人员

## 🔧 常用 Git 命令速查

```bash
# 基本操作
git status                    # 查看状态
git add .                     # 添加所有更改
git commit -m "消息"          # 提交
git push origin main          # 推送到远程

# 分支操作
git branch                    # 查看分支
git checkout -b new-branch   # 创建并切换分支
git merge branch-name         # 合并分支

# 查看历史
git log --oneline             # 简洁历史
git log --graph               # 图形化历史
git show commit-hash          # 查看提交详情

# 标签操作
git tag v1.0.0 -m "版本说明"  # 创建标签
git push origin v1.0.0        # 推送标签
git tag -d v1.0.0             # 删除本地标签
```

## 📝 更新日志

### v2.0.0 (当前版本)
**日期**: 2026-06-09
**功能**:
- ✅ 用户编辑功能
- ✅ 用户逻辑删除
- ✅ 添加新用户
- ✅ 缓存管理系统
- ✅ 服务器自动初始化

**文件变更**:
- 新增: admin.ts, cacheService.ts
- 修改: UserManage.tsx, LevelManage.tsx, Dashboard.tsx

### v1.0.0 (初始版本)
**日期**: 2026-06-08
**功能**:
- 基础后台管理系统框架
- 用户管理界面
- 数据概览页面

---

**最后更新**: 2026-06-09
**维护者**: Development Team