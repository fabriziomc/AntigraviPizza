const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== FIX TAG BRODO IN TURSO ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

async function fixBrodoTags() {
    try {
        // Cerca brodo con base_oil
        const result = await turso.execute({
            sql: "SELECT id, name, tags FROM Ingredients WHERE name LIKE '%brodo%' OR name LIKE '%Brodo%'",
            args: []
        });

        console.log(`Trovati ${result.rows.length} ingredienti brodo\n`);

        let updated = 0;

        for (const ing of result.rows) {
            const tags = JSON.parse(ing.tags || '[]');

            if (tags.includes('base_oil')) {
                // Rimuovi base_oil
                const newTags = tags.filter(t => t !== 'base_oil');
                const newTagsJson = JSON.stringify(newTags);

                console.log(`Aggiornamento: ${ing.name}`);
                console.log(`  Tag prima:  [${tags.join(', ')}]`);
                console.log(`  Tag dopo:   [${newTags.join(', ') || 'nessuno'}]`);

                await turso.execute({
                    sql: 'UPDATE Ingredients SET tags = ? WHERE id = ?',
                    args: [newTagsJson, ing.id]
                });

                updated++;
                console.log(`  ✅ Aggiornato\n`);
            } else {
                console.log(`ℹ️  ${ing.name}: nessun tag base_oil da rimuovere\n`);
            }
        }

        console.log('='.repeat(80));
        console.log(`\n✅ Completato: ${updated} ingredienti aggiornati`);
        console.log('   Brodo e Brodo vegetale non saranno più selezionati dal generatore!\n');
        console.log('='.repeat(80) + '\n');

    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

fixBrodoTags();
