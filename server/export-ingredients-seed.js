// Seed Ingredients - Export current ingredients to seed file
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('📦 Exporting ingredients for seed...\n');

// Get all ingredients with category info
const ingredients = db.prepare(`
    SELECT i.*, c.name as categoryName
    FROM Ingredients i
    LEFT JOIN Categories c ON i.categoryId = c.id
    ORDER BY c.displayOrder, i.name
`).all();

console.log(`Found ${ingredients.length} ingredients\n`);

// Save to seed file
const seedData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    count: ingredients.length,
    ingredients: ingredients.map(ing => ({
        id: ing.id,
        name: ing.name,
        category: ing.categoryName,
        subcategory: ing.subcategory,
        minWeight: ing.minWeight,
        maxWeight: ing.maxWeight,
        defaultUnit: ing.defaultUnit,
        postBake: ing.postBake,
        phase: ing.phase,
        season: ing.season,
        allergens: ing.allergens,
        tags: ing.tags,
        isCustom: ing.isCustom
    }))
};

const seedFile = path.join(__dirname, 'seed-data-ingredients.json');
fs.writeFileSync(seedFile, JSON.stringify(seedData, null, 2));

console.log(`✅ Exported to: ${seedFile}`);

db.close();
