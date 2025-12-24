import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

console.log('📊 Checking Recipes table schema...\n');

// Get table schema
const schema = db.prepare("PRAGMA table_info(Recipes)").all();

console.log('Columns:');
schema.forEach(col => {
    console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
});

console.log('\nTotal columns:', schema.length);

// Try to get a sample recipe
console.log('\n📊 Sample recipe from database:');
const sampleRecipe = db.prepare("SELECT * FROM Recipes LIMIT 1").get();
if (sampleRecipe) {
    console.log(JSON.stringify(sampleRecipe, null, 2));
} else {
    console.log('No recipes in database');
}

db.close();
