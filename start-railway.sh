#!/bin/sh
# Startup script for Railway deployment
# Restores from backup if available, otherwise seeds database

echo "🚀 Starting AntigraviPizza on Railway..."

# Check if database exists and has data
if [ ! -f "/app/data/antigravipizza.db" ]; then
    echo "📦 Database not found, will be created by server..."
fi

# Start the server (it will create the schema automatically)
echo "🌐 Starting server..."
node server/index.js &
SERVER_PID=$!

# Wait for server to start and create schema
sleep 3

# Check if Recipes table is empty
RECIPE_COUNT=$(echo "SELECT COUNT(*) FROM Recipes;" | sqlite3 /app/data/antigravipizza.db 2>/dev/null || echo "0")

if [ "$RECIPE_COUNT" = "0" ]; then
    echo "📊 Database is empty, checking for backup..."
    
    # Try to restore from backup first
    if [ -f "/app/backups/latest-backup.json" ]; then
        echo "📥 Backup found! Restoring database..."
        node server/restore-db.js
        
        if [ $? -eq 0 ]; then
            echo "✅ Database restored from backup successfully!"
        else
            echo "⚠️  Restore failed, falling back to seed..."
            node server/seed-ingredients.js
            node server/seed-archetype-weights.js
            node server/seed-preparations.js
        fi
    else
        echo "🌱 No backup found, seeding default data..."
        node server/seed-ingredients.js
        echo "🎨 Seeding archetype weights..."
        node server/seed-archetype-weights.js
        echo "🍳 Seeding preparations..."
        node server/seed-preparations.js
        echo "✅ Database seeded successfully!"
    fi
else
    echo "✅ Database already has $RECIPE_COUNT recipes, skipping restore/seed"
fi

# Wait for server process
wait $SERVER_PID
