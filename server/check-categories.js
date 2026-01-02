// Check all categories distribution
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('📊 Distribuzione ingredienti per categoria:\n');

const stats = db.prepare(`
    SELECT c.name, c.icon, COUNT(i.id) as count
    FROM Categories c
    LEFT JOIN Ingredients i ON c.id = i.categoryId
    GROUP BY c.id
    ORDER BY c.displayOrder
`).all();

stats.forEach(cat => {
    console.log(`${cat.icon} ${cat.name.padEnd(30)} ${cat.count} ingredienti`);
});

console.log('\n' + '='.repeat(50));
const total = stats.reduce((sum, cat) => sum + cat.count, 0);
console.log(`TOTALE: ${total} ingredienti`);

// Check Impasti specifically
console.log('\n🌾 Ingredienti in categoria Impasti:');
const impasti = db.prepare(`
    SELECT i.name
    FROM Ingredients i
    JOIN Categories c ON i.categoryId = c.id
    WHERE c.name = 'Impasti'
    ORDER BY i.name
`).all();

if (impasti.length === 0) {
    console.log('  (nessuno)');
} else {
    impasti.forEach(ing => console.log(`  - ${ing.name}`));
}

// Check Altro specifically
console.log('\n📦 Ingredienti in categoria Altro:');
const altro = db.prepare(`
    SELECT i.name
    FROM Ingredients i
    JOIN Categories c ON i.categoryId = c.id
    WHERE c.name = 'Altro'
    ORDER BY i.name
`).all();

if (altro.length === 0) {
    console.log('  (nessuno)');
} else {
    altro.forEach(ing => console.log(`  - ${ing.name}`));
}

db.close();
