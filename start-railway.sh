#!/bin/sh
set -e

echo "🚀 Starting AntigraviPizza on Railway..."
echo "📍 Working directory: $(pwd)"
echo "📂 Contents: $(ls -la)"

# Check if database exists
DB_PATH="/app/data/antigravipizza.db"
if [ ! -f "$DB_PATH" ]; then
    echo "📦 Database not found at $DB_PATH"
    echo "🌱 Initializing database..."
    
    # Run initialization scripts
    node /app/server/init-schema.js || echo "⚠️ Schema init failed"
    node /app/server/seed-categories.js || echo "⚠️ Categories seed failed"
    node /app/server/seed-ingredients.js || echo "⚠️ Ingredients seed failed"
    node /app/server/seed-preparations.js || echo "⚠️ Preparations seed failed"
    
    echo "✅ Database initialization completed"
else
    echo "✅ Database found at $DB_PATH"
fi

# Start the application
echo "🎯 Starting Node.js server..."
echo "🔧 PORT: ${PORT:-3000}"
echo "🔧 NODE_ENV: ${NODE_ENV:-development}"
exec node server/index.js
