import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

console.log('=== Migrazione Ingredienti Preparazioni a IDs ===\n');
console.log('Obiettivo: Convertire gli ingredienti delle preparazioni');
console.log('da JSON con dati completi a JSON con solo ingredientId\n');

// 1. Crea una mappa di ingredienti nome -> id
console.log('📋 Creazione mappa ingredienti...');
const ingredients = db.prepare('SELECT id, name FROM ingredients').all();
const ingredientMap = new Map();

ingredients.forEach(ing => {
    // Normalizza il nome per il matching (lowercase, trim)
    const normalizedName = ing.name.toLowerCase().trim();
    ingredientMap.set(normalizedName, ing.id);
});

console.log(`✅ Mappa creata con ${ingredientMap.size} ingredienti\n`);

// 2. Recupera tutte le preparazioni
console.log('📦 Recupero preparazioni...');
const preparations = db.prepare('SELECT id, name, ingredients FROM preparations').all();
console.log(`✅ Trovate ${preparations.length} preparazioni\n`);

// 3. Migra ogni preparazione
console.log('🔄 Inizio migrazione...\n');

const updateStmt = db.prepare('UPDATE preparations SET ingredients = ? WHERE id = ?');
let migrated = 0;
let alreadyMigrated = 0;
let errors = 0;
const notFoundIngredients = new Set();

for (const prep of preparations) {
    try {
        if (!prep.ingredients || prep.ingredients === '[]') {
            continue;
        }

        const ingredientsList = JSON.parse(prep.ingredients);
        let needsMigration = false;
        const migratedIngredients = [];

        for (const ing of ingredientsList) {
            // Se ha già ingredientId, è già migrato
            if (ing.ingredientId) {
                migratedIngredients.push(ing);
                continue;
            }

            // Se ha il name, deve essere migrato
            if (ing.name) {
                needsMigration = true;
                const normalizedName = ing.name.toLowerCase().trim();
                const ingredientId = ingredientMap.get(normalizedName);

                if (ingredientId) {
                    // Crea nuovo oggetto con solo ingredientId e dati di quantità
                    migratedIngredients.push({
                        ingredientId: ingredientId,
                        quantity: ing.quantity || 100,
                        unit: ing.unit || 'g',
                        perPortion: ing.perPortion || ((ing.quantity || 100) / 4).toFixed(2)
                    });
                } else {
                    console.warn(`⚠️  Ingrediente non trovato: "${ing.name}" nella preparazione "${prep.name}"`);
                    notFoundIngredients.add(ing.name);
                    // Mantieni l'oggetto originale per non perdere dati
                    migratedIngredients.push(ing);
                    errors++;
                }
            } else {
                // Oggetto senza name né ingredientId - mantieni così
                migratedIngredients.push(ing);
            }
        }

        if (needsMigration) {
            // Aggiorna la preparazione con gli ingredienti migrati
            const newIngredientsJson = JSON.stringify(migratedIngredients);
            updateStmt.run(newIngredientsJson, prep.id);
            migrated++;
            console.log(`✓ ${prep.name}`);
        } else {
            alreadyMigrated++;
        }

    } catch (error) {
        console.error(`❌ Errore con preparazione "${prep.name}":`, error.message);
        errors++;
    }
}

console.log('\n=== RISULTATI MIGRAZIONE ===');
console.log(`✅ Preparazioni migrate: ${migrated}`);
console.log(`ℹ️  Già migrate: ${alreadyMigrated}`);
console.log(`❌ Errori: ${errors}`);

if (notFoundIngredients.size > 0) {
    console.log('\n⚠️  INGREDIENTI NON TROVATI:');
    Array.from(notFoundIngredients).sort().forEach(name => {
        console.log(`   - ${name}`);
    });
    console.log('\nQuesti ingredienti devono essere aggiunti alla tabella Ingredients prima di completare la migrazione.');
}

// 4. Verifica specifica: Emulsione di aglio nero
console.log('\n=== VERIFICA: Emulsione di aglio nero ===');
const emulsionPrep = db.prepare('SELECT * FROM preparations WHERE name = ?').get('Emulsione di aglio nero');

if (emulsionPrep) {
    const ingredients = JSON.parse(emulsionPrep.ingredients || '[]');
    console.log(`Numero ingredienti: ${ingredients.length}`);

    ingredients.forEach((ing, index) => {
        if (ing.ingredientId) {
            const ingData = db.prepare('SELECT name FROM ingredients WHERE id = ?').get(ing.ingredientId);
            console.log(`${index + 1}. ${ingData ? ingData.name : 'ID: ' + ing.ingredientId} (${ing.quantity} ${ing.unit})`);

            if (ingData && ingData.name.toLowerCase() === 'aglio nero') {
                console.log('   ✅ Aglio nero trovato e correttamente referenziato tramite ID!');
            }
        } else {
            console.log(`${index + 1}. ${ing.name || 'Unknown'} (${ing.quantity} ${ing.unit}) - ⚠️ Senza ingredientId`);
        }
    });
} else {
    console.log('❌ Preparazione "Emulsione di aglio nero" non trovata');
}

db.close();
console.log('\n✓ Database chiuso');
console.log('\n📝 Nota: Ricordati di aggiornare anche seed-data-preparations.json con la stessa struttura!');
