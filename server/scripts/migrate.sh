#!/bin/bash
set -e

# 数据库连接配置（从环境变量读取，或使用默认值）
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-54321}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-AcSNetjbsKSbrbjNFMNtgF5rODjkOC9N}"
DB_NAME="${DB_NAME:-stock_app}"
CONTAINER_NAME="${CONTAINER_NAME:-stockshare-postgres}"

echo "🔄 Running database migration..."
echo "📍 Target: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SQL_FILE="${SCRIPT_DIR}/../src/db/init.sql"

# 检查是否有 Docker 容器在运行
if command -v docker &> /dev/null && docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "📦 Using Docker container: ${CONTAINER_NAME}"
    docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" < "${SQL_FILE}"
elif command -v psql &> /dev/null; then
    echo "💻 Using local psql client"
    export PGPASSWORD="${DB_PASSWORD}"
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "${SQL_FILE}"
else
    echo "❌ Error: Neither Docker container '${CONTAINER_NAME}' nor psql client found"
    echo "Please either:"
    echo "  1. Start Docker container: docker compose up -d"
    echo "  2. Install PostgreSQL client: apt-get install postgresql-client"
    exit 1
fi

echo "✅ Migration completed successfully!"
