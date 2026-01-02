import Database from 'better-sqlite3';

const db = new Database('./antigravipizza.db');

console.log('🗑️ Deleting all ArchetypeWeights...');
const result = db.prepare('DELETE FROM ArchetypeWeights').run();
console.log(`✅ Deleted ${result.changes} rows`);

const count = db.prepare('SELECT COUNT(*) as count FROM ArchetypeWeights').get();
console.log(`Current rows: ${count.count}`);

db.close();
