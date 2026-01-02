// Fix Fior di latte category in recipes and preparations
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🔧 Fixing Fior di latte category...\n');

let fixed = 0;

// Fix in Recipes
console.log('=== RECIPES ===');
const recipes = db.prepare('SELECT id, name, baseIngredients FROM Recipes').all();
const updateRecipe = db.prepare('UPDATE Recipes SET baseIngredients = ? WHERE id = ?');

recipes.forEach(recipe => {
    try {
        const ingredients = JSON.parse(recipe.baseIngredients);
        let modified = false;

        ingredients.forEach(ing => {
            if (ing.name.toLowerCase().includes('fior di latte')) {
                if (ing.category !== 'Formaggi') {
                    console.log(`  ${recipe.name}: ${ing.name} (${ing.category} → Formaggi)`);
                    ing.category = 'Formaggi';
                    modified = true;
                    fixed++;
                }
            }
        });

        if (modified) {
            updateRecipe.run(JSON.stringify(ingredients), recipe.id);
        }
    } catch (error) {
        console.error(`  ❌ Error in recipe ${recipe.name}:`, error.message);
    }
});

// Fix in Preparations
console.log('\n=== PREPARATIONS ===');
const preparations = db.prepare('SELECT id, name, ingredients FROM Preparations').all();
const updatePrep = db.prepare('UPDATE Preparations SET ingredients = ? WHERE id = ?');

preparations.forEach(prep => {
    try {
        const ingredients = JSON.parse(prep.ingredients);
        let modified = false;

        ingredients.forEach(ing => {
            if (ing.name.toLowerCase().includes('fior di latte')) {
                if (ing.category !== 'Formaggi') {
                    console.log(`  ${prep.name}: ${ing.name} (${ing.category} → Formaggi)`);
                    ing.category = 'Formaggi';
                    modified = true;
                    fixed++;
                }
            }
        });

        if (modified) {
            updatePrep.run(JSON.stringify(ingredients), prep.id);
        }
    } catch (error) {
        console.error(`  ❌ Error in preparation ${prep.name}:`, error.message);
    }
});

console.log(`\n✅ Fixed ${fixed} occurrences of Fior di latte`);

// Verify
console.log('\n🔍 Verification:');
const verify = db.prepare(`
  SELECT DISTINCT json_extract(value, '$.category') as category, json_extract(value, '$.name') as name
  FROM Recipes, json_each(baseIngredients)
  WHERE json_extract(value, '$.name') LIKE '%Fior di latte%'
  UNION
  SELECT DISTINCT json_extract(value, '$.category') as category, json_extract(value, '$.name') as name
  FROM Preparations, json_each(ingredients)
  WHERE json_extract(value, '$.name') LIKE '%Fior di latte%'
`).all();

verify.forEach(row => {
    console.log(`  ${row.name}: ${row.category}`);
});

db.close();
