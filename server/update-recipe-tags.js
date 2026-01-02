import { getDb } from './db.js';

/**
 * Script per aggiornare i tag delle ricette esistenti
 * Aggiunge "Rossa" alle pizze con pomodoro e "Bianca" a quelle senza
 */

async function updateRecipeTags() {
    console.log('🔄 Inizio aggiornamento tag ricette...\n');

    const db = getDb();
    const isTurso = typeof db?.execute === 'function';
    const isSQLite = typeof db?.prepare === 'function';

    if (!isTurso && !isSQLite) {
        console.error('❌ Database non riconosciuto');
        process.exit(1);
    }

    // Fetch all recipes
    let recipes;
    if (isSQLite) {
        const stmt = db.prepare('SELECT * FROM Recipes');
        recipes = stmt.all();
    } else {
        const result = await db.execute('SELECT * FROM Recipes');
        recipes = result.rows;
    }

    console.log(`📊 Trovate ${recipes.length} ricette\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const recipe of recipes) {
        try {
            // Parse ingredients
            const baseIngredients = typeof recipe.baseIngredients === 'string'
                ? JSON.parse(recipe.baseIngredients)
                : recipe.baseIngredients || [];

            // Parse current tags
            let tags = typeof recipe.tags === 'string'
                ? JSON.parse(recipe.tags)
                : recipe.tags || [];

            // Check if has tomato base
            const hasBase = baseIngredients.some(i =>
                (i.category === 'Salsa' || i.category === 'Basi e Salse') &&
                (i.name && (i.name.includes('Pomodoro') || i.name.includes('pomodoro')))
            );

            // Check if has meat
            const hasMeat = baseIngredients.some(i =>
                i.category === 'Carne' || i.category === 'Carni e Salumi'
            );

            // Determine what tags should be added
            let needsUpdate = false;
            const newTags = [...tags];

            // Add/fix Rossa/Bianca
            if (hasBase) {
                if (!newTags.includes('Rossa')) {
                    newTags.push('Rossa');
                    needsUpdate = true;
                }
                // Remove Bianca if incorrectly tagged
                const biancaIndex = newTags.indexOf('Bianca');
                if (biancaIndex > -1) {
                    newTags.splice(biancaIndex, 1);
                    needsUpdate = true;
                }
            } else {
                if (!newTags.includes('Bianca')) {
                    newTags.push('Bianca');
                    needsUpdate = true;
                }
                // Remove Rossa if incorrectly tagged
                const rossaIndex = newTags.indexOf('Rossa');
                if (rossaIndex > -1) {
                    newTags.splice(rossaIndex, 1);
                    needsUpdate = true;
                }
            }

            // Add Vegetariana if no meat
            if (!hasMeat && !newTags.includes('Vegetariana')) {
                newTags.push('Vegetariana');
                needsUpdate = true;
            }

            if (needsUpdate) {
                const tagsJson = JSON.stringify(newTags);

                if (isSQLite) {
                    const updateStmt = db.prepare('UPDATE Recipes SET tags = ? WHERE id = ?');
                    updateStmt.run(tagsJson, recipe.id);
                } else {
                    await db.execute({
                        sql: 'UPDATE Recipes SET tags = ? WHERE id = ?',
                        args: [tagsJson, recipe.id]
                    });
                }

                console.log(`✅ ${recipe.name}`);
                console.log(`   Tags aggiornati: ${newTags.join(', ')}`);
                console.log(`   (aveva: ${tags.join(', ')})\n`);
                updated++;
            } else {
                console.log(`⏭️  ${recipe.name} - già corretto`);
                skipped++;
            }
        } catch (error) {
            console.error(`❌ Errore aggiornando ${recipe.name}:`, error.message);
            errors++;
        }
    }

    console.log('\n📊 RIEPILOGO:');
    console.log(`   ✅ Ricette aggiornate: ${updated}`);
    console.log(`   ⏭️  Ricette già corrette: ${skipped}`);
    console.log(`   ❌ Errori: ${errors}`);
    console.log(`   📊 Totale: ${recipes.length}`);
}

// Run the script
updateRecipeTags()
    .then(() => {
        console.log('\n✅ Script completato!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Errore durante l\'esecuzione:', error);
        process.exit(1);
    });
