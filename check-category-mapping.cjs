const Database = require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('📊 Current Category Mapping in Database:\n');
const cats = db.prepare('SELECT id, name FROM Categories ORDER BY displayOrder').all();

console.log('JavaScript Mapping for db-adapter.js:');
console.log('\nstatic CATEGORY_UUID_MAP = {');
cats.forEach(c => {
    console.log(`    '${c.name}': '${c.id}',`);
});
console.log('};\n');

console.log('\nTotal categories:', cats.length);

db.close();
