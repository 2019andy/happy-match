#!/bin/bash
# 自动SCP包装脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCP_EXEC="$SCRIPT_DIR/auto_scp.exp"

chmod +x "$SCP_EXEC" 2>/dev/null

if [ $# -lt 2 ]; then
    echo "用法: $0 <源文件> <目标路径>"
    echo "示例: $0 local-file.txt ubuntu@114.132.69.85:/tmp/"
    exit 1
fi

"$SCP_EXEC" "$1" "$2"
