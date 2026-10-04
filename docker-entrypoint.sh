#!/bin/sh
set -e

# Ensure persistent directories exist
mkdir -p /app/data
mkdir -p /app/public/uploads

# If database doesn't exist yet on the volume, seed it from the template if present
if [ ! -f /app/data/dev.db ] && [ -f /app/prisma/dev.db ]; then
  echo "[Docker] Initializing /app/data/dev.db from existing template..."
  cp /app/prisma/dev.db /app/data/dev.db
fi

# Ensure Prisma schema is synchronized on startup (safe, non-destructive)
echo "[Docker] Synchronizing database schema with Prisma..."
npx prisma db push --skip-generate

echo "[Docker] Starting puyandmbul_web on port ${PORT:-3000}..."
exec "$@"
