// Initialize database schema
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

console.log('🔧 Initializing database schema...\n');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Read and execute schema
const schemaPath = path.join(__dirname, 'sql', 'schema.sqlite.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split by semicolons and execute each statement
const statements = schema.split(';').filter(s => s.trim().length > 0);

let executed = 0;
for (const statement of statements) {
    try {
        db.exec(statement);
        executed++;
    } catch (error) {
        console.error('Error executing statement:', error.message);
    }
}

console.log(`✅ Schema initialized (${executed} statements executed)\n`);

db.close();
