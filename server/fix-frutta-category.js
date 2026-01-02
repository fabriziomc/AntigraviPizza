// Fix frutta secca category - move from wrong categories to "Frutta e Frutta Secca"
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🔧 Fixing Frutta e Frutta Secca category...\n');

// Get Frutta e Frutta Secca category ID
const fruttaCategory = db.prepare('SELECT id FROM Categories WHERE name = ?').get('Frutta e Frutta Secca');

if (!fruttaCategory) {
    console.error('❌ Category not found!');
    process.exit(1);
}

// List of ingredients that should be in Frutta e Frutta Secca
const fruttaIngredients = [
    // Frutta secca
    'Noci',
    'Nocciole',
    'Mandorle',
    'Pistacchi',
    'Pinoli',
    'Granella di pistacchi',
    'Granella di mandorle',
    'Semi di sesamo',
    'Semi di sesamo tostati',
    'Arachidi',

    // Frutta fresca
    'Pere',
    'Fichi',
    'Ananas',
    'Cocco',
    'Kiwi',
    'Lime',
    'Limone',
    'Mango',
    'Melone',
    'Arancia',

    // Confetture/preparazioni di frutta
    'Confettura di fichi',
    'Confettura di pere',
    'Marmellata di fichi',
    'Marmellata di arance'
];

const updateStmt = db.prepare('UPDATE Ingredients SET categoryId = ? WHERE name = ?');

let moved = 0;
fruttaIngredients.forEach(name => {
    const result = updateStmt.run(fruttaCategory.id, name);
    if (result.changes > 0) {
        console.log(`✓ Moved: ${name}`);
        moved++;
    }
});

console.log(`\n✅ Moved ${moved} ingredients to "Frutta e Frutta Secca"`);

// Verify
const count = db.prepare(`
    SELECT COUNT(*) as count
    FROM Ingredients i
    WHERE i.categoryId = ?
`).get(fruttaCategory.id);

console.log(`📊 Total in "Frutta e Frutta Secca": ${count.count}`);

db.close();
