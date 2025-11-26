#!/bin/bash
set -e

echo "==> Environment check..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo 'YES' || echo 'NO')"

echo "==> Checking dist folder..."
ls -la dist/ || { echo "ERROR: dist folder not found!"; exit 1; }

echo "==> Syncing database schema..."
# Use db:push which handles the sync properly
npx drizzle-kit push 2>&1 || {
    echo "==> First sync attempt failed, trying with --force..."
    npx drizzle-kit push --force 2>&1 || {
        echo "==> WARNING: Database sync failed. Tables will be created by the application."
    }
}

echo "==> Starting application on port ${PORT:-10000}..."
NODE_ENV=production node dist/index.js
