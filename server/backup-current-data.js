// Backup current ingredients and preparations
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');
const backupDir = path.join(__dirname, '../backups');

// Create backups directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

const db = new Database(dbPath);

console.log('📦 Creating backup of current data...\n');

// Backup Ingredients
console.log('=== INGREDIENTS ===');
const ingredients = db.prepare('SELECT * FROM Ingredients ORDER BY name').all();
const ingredientsFile = path.join(backupDir, `ingredients-backup-${Date.now()}.json`);
fs.writeFileSync(ingredientsFile, JSON.stringify(ingredients, null, 2));
console.log(`✓ Backed up ${ingredients.length} ingredients to:`);
console.log(`  ${ingredientsFile}\n`);

// Backup Preparations
console.log('=== PREPARATIONS ===');
const preparations = db.prepare('SELECT * FROM Preparations ORDER BY name').all();
const preparationsFile = path.join(backupDir, `preparations-backup-${Date.now()}.json`);
fs.writeFileSync(preparationsFile, JSON.stringify(preparations, null, 2));
console.log(`✓ Backed up ${preparations.length} preparations to:`);
console.log(`  ${preparationsFile}\n`);

// Summary
console.log('=== SUMMARY ===');
console.log(`Total ingredients: ${ingredients.length}`);
console.log(`Total preparations: ${preparations.length}`);

// Category distribution
const categoryCount = {};
ingredients.forEach(ing => {
    categoryCount[ing.category] = (categoryCount[ing.category] || 0) + 1;
});

console.log('\nIngredients by category:');
Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
    });

db.close();

console.log('\n✅ Backup completed successfully!');
