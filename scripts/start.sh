#!/bin/bash
set -e

echo "==> Environment check..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo 'YES' || echo 'NO')"
echo "RENDER_DATABASE_URL is set: $([ -n "$RENDER_DATABASE_URL" ] && echo 'YES' || echo 'NO')"

# Support both DATABASE_URL and RENDER_DATABASE_URL
if [ -z "$DATABASE_URL" ] && [ -n "$RENDER_DATABASE_URL" ]; then
    echo "==> Using RENDER_DATABASE_URL as DATABASE_URL..."
    export DATABASE_URL="$RENDER_DATABASE_URL"
fi

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: No database URL configured!"
    exit 1
fi

echo "==> Checking dist folder..."
ls -la dist/ || { echo "ERROR: dist folder not found!"; exit 1; }

echo "==> Checking dist/public folder..."
ls -la dist/public/ || { echo "ERROR: dist/public folder not found!"; exit 1; }

echo "==> Creating uploads directory..."
mkdir -p uploads

echo "==> Syncing database schema..."
# Note: Sessions table is managed by connect-pg-simple, not Drizzle
# It will be created automatically when the app starts
# Use db:push which handles the sync properly
npx drizzle-kit push 2>&1 || {
    echo "==> First sync attempt failed, trying with --force..."
    npx drizzle-kit push --force 2>&1 || {
        echo "==> WARNING: Database sync failed. Tables will be created by the application."
    }
}

echo "==> Current working directory: $(pwd)"
echo "==> Contents of current directory:"
ls -la

echo "==> Starting application on port ${PORT:-10000}..."
NODE_ENV=production node dist/index.js
