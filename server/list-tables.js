import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
console.log('Database path:', dbPath);

const db = new Database(dbPath);

// List all tables
try {
    console.log('\n=== Listing all tables ===');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables found:', tables.length);
    tables.forEach(table => {
        console.log(`  - ${table.name}`);
    });

    // Check each table for structure
    tables.forEach(table => {
        console.log(`\n=== Table: ${table.name} ===`);
        const info = db.prepare(`PRAGMA table_info(${table.name})`).all();
        console.log('Columns:');
        info.forEach(col => {
            console.log(`  - ${col.name} (${col.type})`);
        });
    });
} catch (error) {
    console.error('Error:', error.message);
}

db.close();
console.log('\n✓ Debug complete');
