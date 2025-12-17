// Fix Ingredients table categories
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🔧 Fixing Ingredients table...\n');

const latticiniIngredients = [
    'Burro',
    'Latte',
    'Latte intero',
    'Panna',
    'Panna fresca',
    'Yogurt',
    'Uova',
    'Crema di burrata'
];

const updateStmt = db.prepare('UPDATE Ingredients SET category = ? WHERE name = ?');

let fixed = 0;
latticiniIngredients.forEach(name => {
    const result = updateStmt.run('Latticini', name);
    if (result.changes > 0) {
        console.log(`✓ ${name} → Latticini`);
        fixed++;
    }
});

console.log(`\n✅ Updated ${fixed} ingredients in Ingredients table`);

// Verify
console.log('\n🔍 Verification:');
const verify = db.prepare('SELECT name, category FROM Ingredients WHERE name IN (?, ?, ?, ?, ?, ?, ?, ?)')
    .all(...latticiniIngredients);

verify.forEach(row => {
    console.log(`  ${row.name}: ${row.category}`);
});

db.close();
