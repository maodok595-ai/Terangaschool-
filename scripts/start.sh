#!/bin/bash
set -e

echo "==> Environment check..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo 'YES' || echo 'NO')"

echo "==> Checking dist folder..."
ls -la dist/ || { echo "ERROR: dist folder not found!"; exit 1; }

echo "==> Syncing database schema (this creates all tables)..."
if npx drizzle-kit push --force; then
    echo "==> Database schema synced successfully!"
else
    echo "==> WARNING: Database sync failed, trying alternative method..."
    npx drizzle-kit push 2>&1 || echo "==> Database might already be synced"
fi

echo "==> Starting application on port ${PORT:-10000}..."
NODE_ENV=production node dist/index.js
