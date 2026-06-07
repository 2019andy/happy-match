#!/bin/bash
# 自动SSH执行包装脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSH_EXEC="$SCRIPT_DIR/ssh_exec.exp"

chmod +x "$SSH_EXEC" 2>/dev/null

if [ $# -eq 0 ]; then
    echo "用法: $0 <命令>"
    echo "示例: $0 'ls -la /opt/happy-match'"
    exit 1
fi

"$SSH_EXEC" "$1"
