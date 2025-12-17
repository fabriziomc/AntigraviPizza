// List all ingredients in "Altro" category
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('\n📊 INGREDIENTS IN "ALTRO" CATEGORY\n');

const altroIngredients = new Set();

// From Recipes
const recipes = db.prepare('SELECT baseIngredients FROM Recipes').all();
recipes.forEach(recipe => {
    try {
        const ingredients = JSON.parse(recipe.baseIngredients);
        ingredients.forEach(ing => {
            if (ing.category === 'Altro') {
                altroIngredients.add(ing.name);
            }
        });
    } catch (e) { }
});

// From Preparations
const preps = db.prepare('SELECT ingredients FROM Preparations').all();
preps.forEach(prep => {
    try {
        const ingredients = JSON.parse(prep.ingredients);
        ingredients.forEach(ing => {
            if (ing.category === 'Altro') {
                altroIngredients.add(ing.name);
            }
        });
    } catch (e) { }
});

const sorted = Array.from(altroIngredients).sort();
console.log(`Found ${sorted.length} unique ingredients in "Altro":\n`);
sorted.forEach(ing => console.log(`  - ${ing}`));

db.close();
