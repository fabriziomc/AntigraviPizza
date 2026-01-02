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
} else if (DB_TYPE === 'turso') {
    // Turso (LibSQL) implementation
    const { createClient } = await import('@libsql/client');

    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        throw new Error('❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in environment variables');
    }

    db = createClient({
        url,
        authToken
    });

    dbType = 'turso';
    console.log('✅ Turso database connected at:', url);

    // Initialize schema (Turso uses libSQL which is SQLite-compatible)
    async function initSchema() {
        const path = (await import('path')).default;
        const fs = (await import('fs')).default;
        const { fileURLToPath } = await import('url');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const schemaPath = path.join(__dirname, 'sql', 'schema.sqlite.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolons and execute each statement
        const statements = schema.split(';').filter(s => s.trim().length > 0);

        for (const statement of statements) {
            try {
                await db.execute(statement);
            } catch (error) {
                // Ignore 'table already exists' errors
                if (!error.message.includes('already exists')) {
                    console.error('Schema init error:', error.message);
                }
            }
        }

        console.log('✅ Database schema initialized');
    }

    // Initialize schema on first run
    await initSchema();
}

export function getDb() {
    return db;
}

export function getDbType() {
    return dbType;
}

export { db };

