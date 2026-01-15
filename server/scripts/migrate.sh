#!/bin/bash
set -e

# 数据库连接配置（从环境变量读取，或使用默认值）
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-stock_app}"

echo "🔄 Running database migration..."
echo "📍 Target: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# 设置 PGPASSWORD 环境变量以避免密码提示
export PGPASSWORD="${DB_PASSWORD}"

# 执行迁移脚本
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "$(dirname "$0")/../src/db/init.sql"

echo "✅ Migration completed successfully!"
