#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Seeding database..."
  node prisma/seed.js
fi

echo "Starting API server..."
exec node dist/server.js
