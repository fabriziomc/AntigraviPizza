const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== RICERCA IN TABELLA PREPARATIONS ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

async function searchPreparations() {
    try {
        console.log('Cerco nelle Preparations...\n');

        const searches = [
            '%frullare%',
            '%mango%',
            '%bicchiere%',
            '%latte%acqua%'
        ];

        const foundPreps = new Map();

        for (const pattern of searches) {
            const result = await turso.execute({
                sql: 'SELECT id, name FROM Preparations WHERE LOWER(name) LIKE LOWER(?)',
                args: [pattern]
            });

            if (result.rows.length > 0) {
                console.log(`📌 Pattern: "${pattern}" - ${result.rows.length} risultati`);
                result.rows.forEach(prep => {
                    console.log(`   - "${prep.name}" (ID: ${prep.id})`);
                    if (!foundPreps.has(prep.id)) {
                        foundPreps.set(prep.id, prep);
                    }
                });
                console.log('');
            }
        }

        console.log('='.repeat(80));

        if (foundPreps.size > 0) {
            console.log(`\n✓ Trovate ${foundPreps.size} preparazioni\n`);
            console.log('⚠️  Questi sono nella tabella PREPARATIONS,non INGREDIENTS.\n');
        } else {
            console.log('\nNessuna preparazione trovata.\n');
        }

        // Verifica anche il totale di ingredienti in Turso
        console.log('='.repeat(80));
        console.log('\n📊 STATO ATTUALE TURSO\n');

        const ingCount = await turso.execute('SELECT COUNT(*) as count FROM Ingredients');
        console.log(`Totale Ingredients in Turso: ${ingCount.rows[0].count}`);

        const prepCount = await turso.execute('SELECT COUNT(*) as count FROM Preparations');
        console.log(`Totale Preparations in Turso: ${prepCount.rows[0].count}\n`);

    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

searchPreparations();
