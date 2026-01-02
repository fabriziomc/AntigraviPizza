import Database from 'better-sqlite3';

const db = new Database('./antigravipizza.db');

console.log('🔍 Checking Preparations table schema...\n');

const schema = db.prepare("PRAGMA table_info(Preparations)").all();

console.log('Current columns:');
schema.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
});

db.close();
