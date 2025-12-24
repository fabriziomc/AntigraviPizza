/**
 * Script per eliminare le "istruzioni" travestite da ingredienti
 * Step 1: Identifica quali preparazioni le usano
 * Step 2: Rimuove i riferimenti dalle preparazioni
 * Step 3: Elimina gli ingredienti dal database
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

console.log('🧹 PULIZIA INGREDIENTI INVALIDI (Istruzioni)\n');
console.log('='.repeat(70));

const db = new Database(dbPath);

// Lista delle "istruzioni" da rimuovere
const instructionsToRemove = [
    'Frullare il tutto a crudo',
    'Grigliare a fette verticali sottili',
    'Pulire gamberi',
    'bollire le patate viola intere senza buccia',
    'frullare mango con olio',
    'marinatura: Salsa di soia',
    'olio e peperoncino',
    'sale e pepe',
    'soffriggere nell\'olio il sedano',
    'unire lime',
    'la carota e la cipolla',
    '1 bicchiere di latte e 1 di acqua'
];

try {
    db.prepare('BEGIN TRANSACTION').run();

    console.log(`\n📋 Istruzioni da rimuovere: ${instructionsToRemove.length}\n`);

    let totalRemoved = 0;
    let preparationsUpdated = 0;

    for (const instructionName of instructionsToRemove) {
        console.log(`\n🔍 Processando: "${instructionName}"`);

        // 1. Trova l'ID dell'ingrediente
        const ingredient = db.prepare('SELECT id, name FROM Ingredients WHERE name = ?').get(instructionName);

        if (!ingredient) {
            console.log('   ⚠️  Non trovato in database, skip');
            continue;
        }

        console.log(`   ID: ${ingredient.id}`);

        // 2. Trova preparazioni che lo usano
        const preparations = db.prepare('SELECT id, name, ingredients FROM Preparations').all();

        let foundInPreparations = [];

        for (const prep of preparations) {
            const ingredients = prep.ingredients ? JSON.parse(prep.ingredients) : [];

            // Controlla se questa preparazione usa questo ingrediente
            const hasIngredient = ingredients.some(ing =>
                ing.ingredientId === ingredient.id || ing.name === instructionName
            );

            if (hasIngredient) {
                foundInPreparations.push({
                    id: prep.id,
                    name: prep.name,
                    ingredients: ingredients
                });
            }
        }

        if (foundInPreparations.length > 0) {
            console.log(`   📦 Trovato in ${foundInPreparations.length} preparazioni:`);

            // 3. Rimuovi dai ingredients array delle preparazioni
            for (const prep of foundInPreparations) {
                console.log(`      - ${prep.name}`);

                // Filtra via questo ingrediente
                const updatedIngredients = prep.ingredients.filter(ing =>
                    ing.ingredientId !== ingredient.id && ing.name !== instructionName
                );

                // Aggiorna la preparazione
                const updateStmt = db.prepare('UPDATE Preparations SET ingredients = ? WHERE id = ?');
                updateStmt.run(JSON.stringify(updatedIngredients), prep.id);

                preparationsUpdated++;
            }
        } else {
            console.log('   ✓ Non usato in nessuna preparazione');
        }

        // 4. Elimina l'ingrediente
        const deleteStmt = db.prepare('DELETE FROM Ingredients WHERE id = ?');
        const result = deleteStmt.run(ingredient.id);

        if (result.changes > 0) {
            console.log('   ✅ Ingrediente eliminato dal database');
            totalRemoved++;
        }
    }

    db.prepare('COMMIT').run();

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ PULIZIA COMPLETATA:\n');
    console.log(`   Ingredienti rimossi: ${totalRemoved}`);
    console.log(`   Preparazioni aggiornate: ${preparationsUpdated}`);

    // Verifica finale
    const remaining = db.prepare(`
        SELECT COUNT(*) as count 
        FROM Ingredients 
        WHERE name IN (${instructionsToRemove.map(() => '?').join(',')})
    `).get(...instructionsToRemove);

    console.log(`   Istruzioni rimanenti: ${remaining.count}`);

    if (remaining.count === 0) {
        console.log('\n🎉 Tutti gli ingredienti-istruzione sono stati rimossi con successo!\n');
    } else {
        console.log('\n⚠️  Alcune istruzioni potrebbero essere ancora presenti\n');
    }

} catch (error) {
    db.prepare('ROLLBACK').run();
    console.error('\n❌ Errore durante la pulizia:', error.message);
    console.error(error.stack);
    process.exit(1);
} finally {
    db.close();
}
