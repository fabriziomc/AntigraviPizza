import dotenv from 'dotenv';
dotenv.config();

const DB_TYPE = process.env.DB_TYPE || 'sqlite';

let db = null;
let dbType = DB_TYPE;

if (DB_TYPE === 'sqlite') {
    // SQLite implementation
    const Database = (await import('better-sqlite3')).default;
    const path = (await import('path')).default;
    const { fileURLToPath } = await import('url');
    const fs = (await import('fs')).default;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Use volume path in production (Railway), local path otherwise
    const dbPath = process.env.NODE_ENV === 'production'
        ? '/app/data/antigravipizza.db'
        : path.join(__dirname, '..', 'antigravipizza.db');

    db = new Database(dbPath);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    console.log(`✅ SQLite database initialized at: ${dbPath}`);

    // Initialize schema
    function initSchema() {
        const schemaPath = path.join(__dirname, 'sql', 'schema.sqlite.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolons and execute each statement
        const statements = schema.split(';').filter(s => s.trim().length > 0);

        for (const statement of statements) {
            db.exec(statement);
        }

        console.log('✅ Database schema initialized');
    }

    // Initialize schema on first run
    initSchema();

    // Seed initial data (Categories, Ingredients, Preparations)
    console.log('🌱 Seeding initial data...');
    try {
        const { seedCategories } = await import('./seed-categories.js');
        const { seedIngredients } = await import('./seed-ingredients.js');
        const { seedPreparations } = await import('./seed-preparations.js');

        await seedCategories();
        await seedIngredients();
        await seedPreparations();

        console.log('✅ Database seeding completed\n');
    } catch (error) {
        console.error('⚠️  Seeding error:', error.message);
    }
} else if (DB_TYPE === 'mssql') {
    // SQL Server implementation
    console.log('✅ SQL Server mode enabled');
    // Connection will be handled by db-mssql.js
}

export function getDb() {
    return db;
}

export function getDbType() {
    return dbType;
}

export { db };

