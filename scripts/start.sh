#!/bin/bash

echo "==> Syncing database schema..."
./node_modules/.bin/drizzle-kit push || echo "Database sync skipped or failed"

echo "==> Starting application..."
node dist/index.js
