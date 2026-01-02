import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
const schemaPath = path.join(__dirname, 'sql', 'schema.sqlite.sql');

console.log('Database path:', dbPath);
console.log('Schema path:', schemaPath);

const db = new Database(dbPath);
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split by semicolons and execute each statement
const statements = schema.split(';').filter(s => s.trim().length > 0);

console.log(`\nExecuting ${statements.length} SQL statements...\n`);

for (const statement of statements) {
    try {
        db.exec(statement);
        const match = statement.match(/CREATE\s+(TABLE|INDEX)\s+IF\s+NOT\s+EXISTS\s+(\w+)/i);
        if (match) {
            console.log(`✓ Created/verified ${match[1].toLowerCase()}: ${match[2]}`);
        }
    } catch (error) {
        console.error('✗ Error executing statement:', error.message);
        console.error('Statement:', statement.substring(0, 100) + '...');
    }
}

console.log('\n=== Verifying tables created  ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables found:', tables.length);
tables.forEach(table => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
    console.log(`  - ${table.name}: ${count.count} rows`);
});

db.close();
console.log('\n✓ Schema initialization complete');
