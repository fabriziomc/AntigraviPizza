import Database from 'better-sqlite3';

const db = new Database('./antigravipizza.db');

console.log('📊 Database Tables:');
const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
tables.forEach(t => console.log(`  - ${t.name}`));

console.log('\n🔍 Checking Preparations table...');
try {
    const count = db.prepare('SELECT COUNT(*) as count FROM Preparations').get();
    console.log(`✅ Preparations table exists with ${count.count} rows`);

    const sample = db.prepare('SELECT * FROM Preparations LIMIT 1').get();
    console.log('📝 Sample preparation:', sample);
} catch (err) {
    console.error('❌ Error accessing Preparations table:', err.message);
}

db.close();
