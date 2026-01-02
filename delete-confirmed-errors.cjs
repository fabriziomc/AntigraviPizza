const Database = require('better-sqlite3').default || require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('\n=== ELIMINAZIONE INGREDIENTI ERRATI ===\n');

// ID confermati da eliminare
const idsToDelete = [
    'e0eeeaa7-4da6-4f4c-aa2e-8885c41c258a', // soffriggere nell'olio il sedano
    '804b0852-1ef0-4a34-84cf-99abca9cf955'  // 100 gr di farina di castagne
];

// Mostra cosa verrà eliminato
console.log('Ingredienti da eliminare:\n');
idsToDelete.forEach((id, index) => {
    const ingredient = db.prepare('SELECT * FROM Ingredients WHERE id = ?').get(id);
    if (ingredient) {
        console.log(`${index + 1}. "${ingredient.name}"`);
        console.log(`   ID: ${id}`);
        console.log(`   Categoria: ${ingredient.categoryId}\n`);
    } else {
        console.log(`${index + 1}. ID ${id} - ❌ NON TROVATO NEL DATABASE\n`);
    }
});

console.log('='.repeat(80));
console.log('\n🔍 Verifica utilizzo degli ingredienti...\n');

let hasUsages = false;

idsToDelete.forEach(id => {
    const ingredient = db.prepare('SELECT name FROM Ingredients WHERE id = ?').get(id);
    if (!ingredient) return;

    // Controlla se è usato in ricette
    const recipeUsages = db.prepare(`
    SELECT COUNT(*) as count 
    FROM RecipeIngredients 
    WHERE ingredientId = ?
  `).get(id);

    // Controlla se è usato in preparazioni  
    const prepUsages = db.prepare(`
    SELECT COUNT(*) as count 
    FROM PreparationIngredients 
    WHERE ingredientId = ?
  `).get(id);

    if (recipeUsages.count > 0 || prepUsages.count > 0) {
        hasUsages = true;
        console.log(`⚠ "${ingredient.name}" è utilizzato in:`);
        if (recipeUsages.count > 0) {
            console.log(`   - ${recipeUsages.count} ricette`);
        }
        if (prepUsages.count > 0) {
            console.log(`   - ${prepUsages.count} preparazioni`);
        }
        console.log('');
    }
});

if (!hasUsages) {
    console.log('✓ Nessun ingrediente è utilizzato in ricette o preparazioni\n');
} else {
    console.log('⚠️  ATTENZIONE: Alcuni ingredienti sono in uso!');
    console.log('Eliminandoli, le loro associazioni verranno rimosse.\n');
}

console.log('='.repeat(80));
console.log('\nInizio eliminazione...\n');

// Inizia transazione
db.prepare('BEGIN').run();

try {
    let deletedCount = 0;

    idsToDelete.forEach(id => {
        const ingredient = db.prepare('SELECT name FROM Ingredients WHERE id = ?').get(id);
        if (!ingredient) {
            console.log(`⚠ ID ${id} non trovato, salto...`);
            return;
        }

        console.log(`Elimino: "${ingredient.name}"...`);

        // Elimina l'ingrediente
        const result = db.prepare('DELETE FROM Ingredients WHERE id = ?').run(id);

        if (result.changes > 0) {
            deletedCount++;
            console.log(`✅ Eliminato con successo\n`);
        } else {
            console.log(`❌ Errore nell'eliminazione\n`);
        }
    });

    // Commit transazione
    db.prepare('COMMIT').run();

    console.log('='.repeat(80));
    console.log(`\n✅ ELIMINAZIONE COMPLETATA!`);
    console.log(`\nIngredienti eliminati: ${deletedCount}/${idsToDelete.length}\n`);

    // Verifica il totale rimanente
    const totalIngredients = db.prepare('SELECT COUNT(*) as count FROM Ingredients').get();
    console.log(`Totale ingredienti rimanenti nel database: ${totalIngredients.count}\n`);

} catch (error) {
    // Rollback in caso di errore
    db.prepare('ROLLBACK').run();
    console.error('\n❌ ERRORE durante l\'eliminazione:', error.message);
    console.error('Transazione annullata, nessuna modifica applicata.\n');
    process.exit(1);
} finally {
    db.close();
}
