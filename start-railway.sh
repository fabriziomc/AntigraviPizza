#!/bin/sh
# Startup script for Railway deployment
# Seeds database if empty, then starts the server

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

# Check if Ingredients table is empty
INGREDIENT_COUNT=$(echo "SELECT COUNT(*) FROM Ingredients;" | sqlite3 /app/data/antigravipizza.db 2>/dev/null || echo "0")

if [ "$INGREDIENT_COUNT" = "0" ]; then
    echo "🌱 Database is empty, seeding ingredients..."
    node server/seed-ingredients.js
    echo "🎨 Seeding archetype weights..."
    node server/seed-archetype-weights.js
    echo "🍳 Seeding preparations..."
    node server/seed-preparations.js
    echo "✅ Database seeded successfully!"
else
    echo "✅ Database already has $INGREDIENT_COUNT ingredients, skipping seed"
fi

# Wait for server process
wait $SERVER_PID
