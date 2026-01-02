// Check frutta secca ingredients
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🔍 Checking Frutta e Frutta Secca ingredients...\n');

// Get all ingredients with frutta-related names
const keywords = ['per', 'fich', 'noc', 'pist', 'mand', 'pinol', 'nocc', 'arac', 'sesam', 'ananas', 'cocco', 'kiwi', 'lime', 'lemon', 'mango', 'melon'];

const results = db.prepare(`
    SELECT i.name, c.name as category, c.icon
    FROM Ingredients i
    JOIN Categories c ON i.categoryId = c.id
    WHERE ${keywords.map(() => 'LOWER(i.name) LIKE ?').join(' OR ')}
    ORDER BY c.name, i.name
`).all(...keywords.map(k => `%${k}%`));

console.log(`Found ${results.length} ingredients:\n`);

const byCategory = {};
results.forEach(r => {
    if (!byCategory[r.category]) byCategory[r.category] = [];
    byCategory[r.category].push(r.name);
});

Object.entries(byCategory).forEach(([cat, items]) => {
    const icon = results.find(r => r.category === cat)?.icon || '';
    console.log(`${icon} ${cat} (${items.length}):`);
    items.forEach(name => console.log(`  - ${name}`));
    console.log();
});

// Get Frutta e Frutta Secca count
const fruttaCount = db.prepare(`
    SELECT COUNT(*) as count
    FROM Ingredients i
    JOIN Categories c ON i.categoryId = c.id
    WHERE c.name = 'Frutta e Frutta Secca'
`).get();

console.log(`\n📊 Total in "Frutta e Frutta Secca": ${fruttaCount.count}`);

db.close();
