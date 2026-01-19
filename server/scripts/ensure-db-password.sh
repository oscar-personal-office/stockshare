#!/bin/bash

# 确保 PostgreSQL 密码正确设置
# 在启动应用前运行此脚本

set -e

CONTAINER_NAME="${CONTAINER_NAME:-stockshare-postgres}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

echo "🔐 Ensuring PostgreSQL password is correctly set..."

# 检查容器是否运行
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Container ${CONTAINER_NAME} is not running"
    exit 1
fi

# 通过容器内部重置密码（使用 local trust 连接）
docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" <<EOF
ALTER USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
EOF

echo "✅ PostgreSQL password set successfully"
