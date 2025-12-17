// Add basic dough ingredients to Impasti category
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🌾 Adding basic dough ingredients...\n');

// Get Impasti category
const impastiCategory = db.prepare('SELECT id FROM Categories WHERE name = ?').get('Impasti');

if (!impastiCategory) {
    console.error('❌ Impasti category not found!');
    process.exit(1);
}

// Basic dough ingredients
const doughIngredients = [
    { name: 'Farina 00', defaultUnit: 'g', minWeight: 500, maxWeight: 1000 },
    { name: 'Farina Manitoba', defaultUnit: 'g', minWeight: 500, maxWeight: 1000 },
    { name: 'Farina tipo 1', defaultUnit: 'g', minWeight: 500, maxWeight: 1000 },
    { name: 'Farina tipo 2', defaultUnit: 'g', minWeight: 500, maxWeight: 1000 },
    { name: 'Farina integrale', defaultUnit: 'g', minWeight: 500, maxWeight: 1000 },
    { name: 'Semola rimacinata', defaultUnit: 'g', minWeight: 500, maxWeight: 1000 },
    { name: 'Lievito di birra fresco', defaultUnit: 'g', minWeight: 5, maxWeight: 25 },
    { name: 'Lievito di birra secco', defaultUnit: 'g', minWeight: 2, maxWeight: 10 },
    { name: 'Lievito madre', defaultUnit: 'g', minWeight: 100, maxWeight: 300 },
    { name: 'Sale fino', defaultUnit: 'g', minWeight: 10, maxWeight: 30 },
    { name: 'Sale grosso', defaultUnit: 'g', minWeight: 10, maxWeight: 30 },
    { name: 'Acqua', defaultUnit: 'ml', minWeight: 300, maxWeight: 700 },
    { name: 'Olio extravergine di oliva', defaultUnit: 'ml', minWeight: 20, maxWeight: 50 },
    { name: 'Zucchero', defaultUnit: 'g', minWeight: 5, maxWeight: 20 },
    { name: 'Miele', defaultUnit: 'g', minWeight: 5, maxWeight: 20 }
];

const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO Ingredients (id, name, categoryId, defaultUnit, minWeight, maxWeight, phase, isCustom, dateAdded)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let added = 0;
doughIngredients.forEach(ing => {
    const result = insertStmt.run(
        randomUUID(),
        ing.name,
        impastiCategory.id,
        ing.defaultUnit,
        ing.minWeight,
        ing.maxWeight,
        'dough', // Phase for dough ingredients
        0, // Not custom
        Date.now()
    );

    if (result.changes > 0) {
        console.log(`✓ Added: ${ing.name}`);
        added++;
    } else {
        console.log(`⏭️  Already exists: ${ing.name}`);
    }
});

console.log(`\n✅ Added ${added} dough ingredients`);

// Verify
const count = db.prepare(`
    SELECT COUNT(*) as count
    FROM Ingredients i
    WHERE i.categoryId = ?
`).get(impastiCategory.id);

console.log(`📊 Total in "Impasti": ${count.count}`);

db.close();
