#!/bin/bash
set -e

echo "==> Installing all dependencies (including dev)..."
npm ci --include=dev

echo "==> Building frontend with Vite (using Render config)..."
./node_modules/.bin/vite build --config vite.config.render.ts

echo "==> Building backend with esbuild..."
./node_modules/.bin/esbuild server/index-prod.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

echo "==> Creating uploads directory..."
mkdir -p uploads

echo "==> Pushing database schema (if DATABASE_URL is available)..."
if [ -n "$DATABASE_URL" ]; then
  ./node_modules/.bin/drizzle-kit push || echo "Warning: Database push failed, will retry on startup"
else
  echo "DATABASE_URL not set, skipping database push (run manually after deploy)"
fi

echo "==> Build complete!"
echo "==> Contents of dist folder:"
ls -la dist/
