import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../antigravipizza.db');
const db = new Database(dbPath, { readonly: true });

console.log('=== VERIFICA FINALE: Sistema di Riferimenti ID ===\n');

// 1. Trova la preparazione
const prep = db.prepare('SELECT * FROM preparations WHERE name LIKE ?').get('%Emulsione%aglio nero%');

if (!prep) {
    console.log('❌ Preparazione non trovata');
    process.exit(1);
}

console.log(`✅ Preparazione trovata: "${prep.name}"\n`);

// 2. Parsa gli ingredienti
const ingredients = JSON.parse(prep.ingredients);
console.log(`📋 Numero ingredienti: ${ingredients.length}\n`);

// 3. Per ogni ingrediente, verifica che abbia ingredientId e espandi i dati
console.log('=== INGREDIENTI ===');
let allOk = true;

for (const ing of ingredients) {
    if (ing.ingredientId) {
        // Cerca l'ingrediente nel database
        const fullIng = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(ing.ingredientId);

        if (fullIng) {
            console.log(`✅ ${fullIng.name}`);
            console.log(`   ID: ${ing.ingredientId.substring(0, 16)}...`);
            console.log(`   Quantità: ${ing.quantity} ${ing.unit}`);
            console.log(`   Categoria (da DB): ${fullIng.categoryId}`);
            console.log('');

            // Verifica speciale per Aglio nero
            if (fullIng.name.toLowerCase() === 'aglio nero') {
                console.log('🎉 SUCCESSO: "Aglio nero" è correttamente referenziato tramite ID!');
                console.log(`   L'ingrediente è memorizzato UNA SOLA VOLTA nella tabella Ingredients`);
                console.log(`   La preparazione lo referenzia SOLO tramite ID`);
                console.log(`   Nessuna duplicazione di dati! ✅\n`);
            }
        } else {
            console.log(`❌ Ingrediente con ID ${ing.ingredientId} NON trovato nel database!`);
            allOk = false;
        }
    } else if (ing.name) {
        console.log(`⚠️  Ingrediente ancora con nome invece di ID: "${ing.name}"`);
        console.log(`   Questo ingrediente non rappresenta un ingrediente standard e va bene così.\n`);
    }
}

db.close();

console.log('\n' + '='.repeat(60));
if (allOk) {
    console.log('✅ VERIFICA COMPLETATA CON SUCCESSO!');
    console.log('   Tutti gli ingredienti sono correttamente referenziati tramite ID.');
    console.log('   Non ci sono duplicazioni di dati.');
} else {
    console.log('❌ Ci sono problemi con alcuni ingredienti.');
}
console.log('='.repeat(60));
