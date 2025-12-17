#!/bin/sh

echo "🚀 Starting AntigraviPizza on Railway..."

# Check if database exists
if [ ! -f "/app/data/antigravipizza.db" ]; then
    echo "📦 Database not found. Initializing..."
    
    # Initialize schema
    node /app/server/init-schema.js
    
    # Seed data
    echo "🌱 Seeding database..."
    node /app/server/seed-categories.js
    node /app/server/seed-ingredients.js
    node /app/server/seed-preparations.js
    
    echo "✅ Database initialized successfully!"
else
    echo "✅ Database found. Skipping initialization."
fi

# Start the application
echo "🎯 Starting application..."
exec node server/index.js
