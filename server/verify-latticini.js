// Verifica e correggi categorie Latticini
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🔍 Verifica categorie Latticini...\n');

// Check Recipes
console.log('=== RECIPES ===');
const recipes = db.prepare('SELECT id, name, baseIngredients FROM Recipes').all();
let fixed = 0;

recipes.forEach(recipe => {
    try {
        const ingredients = JSON.parse(recipe.baseIngredients);
        let modified = false;

        ingredients.forEach(ing => {
            if (['Burro', 'Latte', 'Latte intero', 'Panna', 'Panna fresca', 'Yogurt', 'Uova', 'Crema di burrata'].includes(ing.name)) {
                if (ing.category !== 'Latticini') {
                    console.log(`  ${recipe.name}: ${ing.name} (${ing.category} → Latticini)`);
                    ing.category = 'Latticini';
                    modified = true;
                    fixed++;
                }
            }
        });

        if (modified) {
            db.prepare('UPDATE Recipes SET baseIngredients = ? WHERE id = ?')
                .run(JSON.stringify(ingredients), recipe.id);
        }
    } catch (error) {
        console.error(`  ❌ Error in recipe ${recipe.name}:`, error.message);
    }
});

// Check Preparations
console.log('\n=== PREPARATIONS ===');
const preparations = db.prepare('SELECT id, name, ingredients FROM Preparations').all();

preparations.forEach(prep => {
    try {
        const ingredients = JSON.parse(prep.ingredients);
        let modified = false;

        ingredients.forEach(ing => {
            if (['Burro', 'Latte', 'Latte intero', 'Panna', 'Panna fresca', 'Yogurt', 'Uova', 'Crema di burrata'].includes(ing.name)) {
                if (ing.category !== 'Latticini') {
                    console.log(`  ${prep.name}: ${ing.name} (${ing.category} → Latticini)`);
                    ing.category = 'Latticini';
                    modified = true;
                    fixed++;
                }
            }
        });

        if (modified) {
            db.prepare('UPDATE Preparations SET ingredients = ? WHERE id = ?')
                .run(JSON.stringify(ingredients), prep.id);
        }
    } catch (error) {
        console.error(`  ❌ Error in preparation ${prep.name}:`, error.message);
    }
});

console.log(`\n✅ Corretti ${fixed} ingredienti`);

// Verify
console.log('\n🔍 Verifica finale...');
const verify = db.prepare(`
  SELECT DISTINCT json_extract(value, '$.category') as category, json_extract(value, '$.name') as name
  FROM Recipes, json_each(baseIngredients)
  WHERE json_extract(value, '$.name') IN ('Burro', 'Latte intero', 'Panna', 'Panna fresca')
  UNION
  SELECT DISTINCT json_extract(value, '$.category') as category, json_extract(value, '$.name') as name
  FROM Preparations, json_each(ingredients)
  WHERE json_extract(value, '$.name') IN ('Burro', 'Latte intero', 'Panna', 'Panna fresca')
`).all();

console.log('\nCategorie trovate:');
verify.forEach(row => {
    console.log(`  ${row.name}: ${row.category}`);
});

db.close();
