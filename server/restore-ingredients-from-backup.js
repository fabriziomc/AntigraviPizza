// Restore ingredients from original backup with correct categories
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');
const backupDir = path.join(__dirname, '../backups');

const db = new Database(dbPath);

console.log('📦 Restoring ingredients from original backup...\n');

// Find the most recent ingredients backup
const backupFiles = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('ingredients-backup-'))
    .sort()
    .reverse();

if (backupFiles.length === 0) {
    console.error('❌ No backup file found!');
    process.exit(1);
}

const backupFile = path.join(backupDir, backupFiles[0]);
console.log(`Using backup: ${backupFile}\n`);

const ingredients = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

console.log(`Found ${ingredients.length} ingredients in backup\n`);

// Get categories
const categories = db.prepare('SELECT * FROM Categories').all();
const categoryMap = {};
categories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
});

// Category mapping from old names to new names
const categoryNameMap = {
    'Formaggi': 'Formaggi',
    'Latticini': 'Latticini',
    'Pesce': 'Pesce e Frutti di Mare',
    'Erbe e Spezie': 'Erbe e Spezie',
    'Verdure': 'Verdure e Ortaggi',
    'Carne': 'Carni e Salumi',
    'Salsa': 'Basi e Salse',
    'Impasto': 'Impasti',
    'Altro': 'Altro'
};

// Ingredients that should be in "Frutta e Frutta Secca" regardless of original category
const fruttaSeccanames = [
    'noci', 'nocciole', 'mandorle', 'pistacchi', 'pinoli', 'arachidi',
    'granella di pistacchi', 'granella di mandorle', 'granella di noci',
    'semi di sesamo', 'semi di girasole', 'semi di zucca',
    'pere', 'fichi', 'ananas', 'cocco', 'kiwi', 'lime', 'limone', 'mango', 'melone', 'arancia',
    'confettura di fichi', 'confettura di pere', 'marmellata'
];

function getCategoryForIngredient(ingredient) {
    const nameLower = ingredient.name.toLowerCase();

    // Check if it's frutta secca
    if (fruttaSeccanames.some(fruit => nameLower.includes(fruit))) {
        return 'Frutta e Frutta Secca';
    }

    // Otherwise use standard mapping
    return categoryNameMap[ingredient.category] || 'Altro';
}

const insertStmt = db.prepare(`
    INSERT INTO Ingredients (id, name, categoryId, subcategory, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let restored = 0;
const categoryStats = {};

ingredients.forEach(ing => {
    // Use intelligent category detection
    const newCategoryName = getCategoryForIngredient(ing);
    const categoryId = categoryMap[newCategoryName];

    if (!categoryId) {
        console.error(`❌ Category not found: ${newCategoryName} (from ${ing.category})`);
        return;
    }

    try {
        insertStmt.run(
            randomUUID(),
            ing.name,
            categoryId,
            ing.subcategory,
            ing.minWeight,
            ing.maxWeight,
            ing.defaultUnit,
            ing.postBake,
            ing.phase,
            ing.season,
            ing.allergens,
            ing.tags,
            ing.isCustom,
            ing.dateAdded
        );

        categoryStats[newCategoryName] = (categoryStats[newCategoryName] || 0) + 1;
        restored++;
    } catch (error) {
        console.error(`❌ Error restoring ${ing.name}:`, error.message);
    }
});

console.log(`\n✅ Restored ${restored}/${ingredients.length} ingredients\n`);

console.log('=== DISTRIBUTION BY CATEGORY ===');
Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    const icon = categories.find(c => c.name === cat)?.icon || '📦';
    console.log(`${icon} ${cat}: ${count}`);
});

db.close();
