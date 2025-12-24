import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');
const db = new Database(dbPath);

// Rimuovi l'ultima istruzione rimasta
const lastInstruction = 'soffriggere nell\'olio il sedano';

const ingredient = db.prepare('SELECT id FROM Ingredients WHERE name = ?').get(lastInstruction);

if (ingredient) {
    // Rimuovi dai preparations
    const preps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();

    for (const prep of preps) {
        const ingredients = prep.ingredients ? JSON.parse(prep.ingredients) : [];
        const updated = ingredients.filter(ing => ing.ingredientId !== ingredient.id && ing.name !== lastInstruction);

        if (updated.length !== ingredients.length) {
            db.prepare('UPDATE Preparations SET ingredients = ? WHERE id = ?').run(JSON.stringify(updated), prep.id);
        }
    }

    // Elimina ingrediente
    db.prepare('DELETE FROM Ingredients WHERE id = ?').run(ingredient.id);
    console.log(`✅ Rimosso: "${lastInstruction}"`);
} else {
    console.log('✓ Già rimosso');
}

// Statistiche finali
const totalIngredients = db.prepare('SELECT COUNT(*) as count FROM Ingredients').get();
const withTags = db.prepare("SELECT COUNT(*) as count FROM Ingredients WHERE tags IS NOT NULL AND tags != '[]'").get();
const coverage = (withTags.count / totalIngredients.count * 100).toFixed(1);

console.log('\n📊 STATISTICHE FINALI:');
console.log(`   Ingredienti totali: ${totalIngredients.count}`);
console.log(`   Con tag: ${withTags.count}`);
console.log(`   Senza tag: ${totalIngredients.count - withTags.count}`);
console.log(`   ✅ Coverage: ${coverage}%\n`);

db.close();
