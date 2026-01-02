// Add missing Latticini ingredients to Ingredients table
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🔧 Adding missing Latticini ingredients...\n');

const latticiniIngredients = [
    { name: 'Burro', minWeight: 20, maxWeight: 100, unit: 'g' },
    { name: 'Latte', minWeight: 50, maxWeight: 200, unit: 'ml' },
    { name: 'Latte intero', minWeight: 50, maxWeight: 200, unit: 'ml' },
    { name: 'Panna', minWeight: 30, maxWeight: 150, unit: 'ml' },
    { name: 'Panna fresca', minWeight: 30, maxWeight: 150, unit: 'ml' },
    { name: 'Yogurt', minWeight: 50, maxWeight: 200, unit: 'g' },
    { name: 'Uova', minWeight: 1, maxWeight: 4, unit: 'pz' }
];

const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO Ingredients 
  (id, name, category, minWeight, maxWeight, defaultUnit, postBake, phase, isCustom, dateAdded)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let added = 0;
latticiniIngredients.forEach(ing => {
    try {
        insertStmt.run(
            randomUUID(),
            ing.name,
            'Latticini',
            ing.minWeight,
            ing.maxWeight,
            ing.unit,
            0, // postBake
            'topping', // phase
            0, // isCustom
            Date.now()
        );
        console.log(`✓ Added ${ing.name}`);
        added++;
    } catch (error) {
        console.log(`  ${ing.name} already exists or error: ${error.message}`);
    }
});

console.log(`\n✅ Added ${added} new ingredients`);

// Verify all Latticini
console.log('\n🔍 All Latticini ingredients:');
const verify = db.prepare('SELECT name, category FROM Ingredients WHERE category = ? ORDER BY name').all('Latticini');

verify.forEach(row => {
    console.log(`  ${row.name}: ${row.category}`);
});

db.close();
