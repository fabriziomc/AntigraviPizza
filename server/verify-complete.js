// Complete verification of Latticini setup
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🔍 COMPLETE LATTICINI VERIFICATION\n');
console.log('='.repeat(50));

// 1. Check Ingredients table
console.log('\n1. INGREDIENTS TABLE:');
const ingredients = db.prepare('SELECT name, category FROM Ingredients ORDER BY category, name').all();
const latticiniIngs = ingredients.filter(i => i.category === 'Latticini');
const altroIngs = ingredients.filter(i => i.category === 'Altro' &&
    ['Burro', 'Latte', 'Latte intero', 'Panna', 'Panna fresca', 'Yogurt', 'Uova', 'Crema di burrata'].includes(i.name));

console.log(`\n   Latticini (${latticiniIngs.length}):`);
latticiniIngs.forEach(i => console.log(`     ✓ ${i.name}`));

if (altroIngs.length > 0) {
    console.log(`\n   ⚠️  Still in ALTRO (${altroIngs.length}):`);
    altroIngs.forEach(i => console.log(`     ❌ ${i.name}`));
}

// 2. Check Recipes
console.log('\n2. RECIPES (baseIngredients):');
const recipes = db.prepare('SELECT id, name, baseIngredients FROM Recipes').all();
let recipeLatticini = 0;
let recipeAltro = 0;

recipes.forEach(recipe => {
    try {
        const ings = JSON.parse(recipe.baseIngredients);
        ings.forEach(ing => {
            if (['Burro', 'Latte', 'Latte intero', 'Panna', 'Panna fresca', 'Yogurt', 'Uova', 'Crema di burrata'].includes(ing.name)) {
                if (ing.category === 'Latticini') {
                    recipeLatticini++;
                } else {
                    recipeAltro++;
                    console.log(`   ❌ ${recipe.name}: ${ing.name} is ${ing.category}`);
                }
            }
        });
    } catch (e) { }
});

console.log(`\n   Latticini: ${recipeLatticini}`);
console.log(`   Altro: ${recipeAltro}`);

// 3. Check Preparations
console.log('\n3. PREPARATIONS (ingredients):');
const preps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();
let prepLatticini = 0;
let prepAltro = 0;

preps.forEach(prep => {
    try {
        const ings = JSON.parse(prep.ingredients);
        ings.forEach(ing => {
            if (['Burro', 'Latte', 'Latte intero', 'Panna', 'Panna fresca', 'Yogurt', 'Uova', 'Crema di burrata'].includes(ing.name)) {
                if (ing.category === 'Latticini') {
                    prepLatticini++;
                } else {
                    prepAltro++;
                    console.log(`   ❌ ${prep.name}: ${ing.name} is ${ing.category}`);
                }
            }
        });
    } catch (e) { }
});

console.log(`\n   Latticini: ${prepLatticini}`);
console.log(`   Altro: ${prepAltro}`);

// 4. Check table schema
console.log('\n4. TABLE SCHEMA:');
const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='Ingredients'").get();
console.log('\n' + schema.sql);

console.log('\n' + '='.repeat(50));

db.close();
