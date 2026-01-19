#!/bin/bash
# 等待 PostgreSQL 启动
until pg_isready -U postgres > /dev/null 2>&1; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 1
done

# 确保密码正确设置
psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';" > /dev/null 2>&1

echo "PostgreSQL password initialized successfully"
