import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

console.log('=== Checking data in tables ===\n');

// Check Categories
const categoriesCount = db.prepare('SELECT COUNT(*) as count FROM Categories').get();
console.log(`Categories: ${categoriesCount.count} rows`);
if (categoriesCount.count > 0) {
    const categories = db.prepare('SELECT * FROM Categories LIMIT 5').all();
    categories.forEach(cat => console.log(`  - ${cat.name}`));
}

// Check Ingredients
const ingredientsCount = db.prepare('SELECT COUNT(*) as count FROM Ingredients').get();
console.log(`\nIngredients: ${ingredientsCount.count} rows`);
if (ingredientsCount.count > 0) {
    const ingredients = db.prepare('SELECT * FROM Ingredients LIMIT 5').all();
    ingredients.forEach(ing => console.log(`  - ${ing.name}`));
}

// Check Preparations
const preparationsCount = db.prepare('SELECT COUNT(*) as count FROM Preparations').get();
console.log(`\nPreparations: ${preparationsCount.count} rows`);
if (preparationsCount.count > 0) {
    const preparations = db.prepare('SELECT * FROM Preparations LIMIT 5').all();
    preparations.forEach(prep => console.log(`  - ${prep.name}`));
}

db.close();
console.log('\n✓ Check complete');
