import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

console.log('📊 Checking for test recipes...\n');

const recipes = db.prepare("SELECT id, name, recipeSource, archetypeUsed FROM Recipes WHERE name LIKE 'Test%'").all();

console.log(`Found ${recipes.length} test recipe(s):\n`);
recipes.forEach(recipe => {
    console.log(`✅ ${recipe.name} (${recipe.id})`);
    console.log(`   Source: ${recipe.recipeSource}`);
    console.log(`   Archetype: ${recipe.archetypeUsed}\n`);
});

db.close();
