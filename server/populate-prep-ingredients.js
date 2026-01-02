import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

console.log('=== Popolamento tabella preparation_ingredients ===\n');

// Recupera tutte le preparazioni
const preparations = db.prepare('SELECT * FROM preparations').all();
console.log(`Trovate ${preparations.length} preparazioni\n`);

// Recupera tutti gli ingredienti per creare una mappa nome -> id
const ingredients = db.prepare('SELECT id, name FROM ingredients').all();
const ingredientMap = new Map();
ingredients.forEach(ing => {
    ingredientMap.set(ing.name.toLowerCase().trim(), ing.id);
});
console.log(`Trovati ${ingredients.size} ingredienti nel database\n`);

// Cancella i dati esistenti nella tabella preparation_ingredients (per evitare duplicati)
db.prepare('DELETE FROM preparation_ingredients').run();
console.log('Tabella preparation_ingredients svuotata\n');

let added = 0;
let notFound = 0;
const notFoundIngredients = new Set();

// Inserisce i collegamenti nella tabella preparation_ingredients
const insertStmt = db.prepare(`
    INSERT INTO preparation_ingredients (id, preparationId, ingredientId, quantity, unit, perPortion)
    VALUES (?, ?, ?, ?, ?, ?)
`);

for (const prep of preparations) {
    if (!prep.ingredients || prep.ingredients === '[]') {
        continue;
    }

    try {
        const ingredientsList = JSON.parse(prep.ingredients);

        for (const ing of ingredientsList) {
            const ingredientName = ing.name.toLowerCase().trim();
            const ingredientId = ingredientMap.get(ingredientName);

            if (ingredientId) {
                insertStmt.run(
                    randomUUID(),
                    prep.id,
                    ingredientId,
                    ing.quantity || 100,
                    ing.unit || 'g',
                    ing.perPortion || (ing.quantity / 4).toFixed(2)
                );
                added++;
            } else {
                notFound++;
                notFoundIngredients.add(ing.name);
            }
        }
    } catch (error) {
        console.error(`Errore elaborando preparazione ${prep.name}:`, error.message);
    }
}

console.log('\n=== RISULTATI ===');
console.log(`✅ Collegamenti aggiunti: ${added}`);
console.log(`❌ Ingredienti non trovati: ${notFound}`);

if (notFoundIngredients.size > 0) {
    console.log('\n=== Ingredienti non trovati nel database ===');
    Array.from(notFoundIngredients).sort().forEach(name => {
        console.log(`  - ${name}`);
    });
}

// Verifica: controlla "Emulsione di aglio nero"
console.log('\n=== VERIFICA: Emulsione di aglio nero ===');
const emulsionPrep = db.prepare('SELECT * FROM preparations WHERE name = ?').get('Emulsione di aglio nero');
if (emulsionPrep) {
    const emulsionIngs = db.prepare(`
        SELECT pi.*, i.name as ingredientName 
        FROM preparation_ingredients pi 
        JOIN ingredients i ON pi.ingredientId = i.id 
        WHERE pi.preparationId = ?
    `).all(emulsionPrep.id);

    console.log(`Ingredienti trovati: ${emulsionIngs.length}`);
    emulsionIngs.forEach(ing => {
        console.log(`  - ${ing.ingredientName} (${ing.quantity} ${ing.unit})`);
    });
} else {
    console.log('Preparazione non trovata nel database');
}

db.close();
console.log('\n✓ Database chiuso');
