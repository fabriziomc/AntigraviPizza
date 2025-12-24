import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');
const db = new Database(dbPath);

// Query semplice
const results = db.prepare(`
    SELECT i.name, c.name as category
    FROM Ingredients i
    LEFT JOIN Categories c ON i.categoryId = c.id
    WHERE i.tags IS NULL OR i.tags = '[]'
    ORDER BY c.name, i.name
`).all();

console.log(`TOTALE: ${results.length} ingredienti senza tag\n`);

// Raggruppa per categoria
const byCategory = {};
results.forEach(r => {
    const cat = r.category || 'Senza Categoria';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(r.name);
});

// Stampa
Object.entries(byCategory).forEach(([cat, items]) => {
    console.log(`\n${cat} (${items.length}):`);
    items.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));
});

db.close();
