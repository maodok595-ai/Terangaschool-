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

echo "==> Build complete!"
echo "==> Contents of dist folder:"
ls -la dist/
echo ""
echo "NOTE: Run 'npx drizzle-kit push' manually after first deploy to sync database schema"
