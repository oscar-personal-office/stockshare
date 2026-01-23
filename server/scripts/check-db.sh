#!/bin/bash
# Database connection check and auto-fix script
# Run this before starting the application

set -e

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-54321}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-stock_app}"
CONTAINER_NAME="${CONTAINER_NAME:-stock_app}"

echo "🔍 Checking database connection..."

# Test connection from host
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ Database connection OK"
    exit 0
fi

echo "⚠️  Database connection failed, attempting to fix..."

# Fix: Reset password inside container
if docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" > /dev/null 2>&1; then
    echo "🔐 Password reset successfully"

    # Test again
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
        echo "✅ Database connection now OK"
        exit 0
    fi
fi

echo "❌ Failed to fix database connection"
exit 1
