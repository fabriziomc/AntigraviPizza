const Database = require('better-sqlite3').default || require('better-sqlite3');
const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== PULIZIA TAG BASE_OIL ===\n');

// Ingredienti che NON dovrebbero avere base_oil
const INGREDIENTS_TO_CLEAN = [
    'Brodo',
    'Brodo vegetale',
    'Brodo di carne',
    'Olio di semi',
    'Acqua',
    'Farina 00',
    'Farina di grano saraceno'
];

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

function cleanSQLite() {
    console.log('📍 SQLITE LOCALE\n');
    const db = new Database('./antigravipizza.db');

    try {
        let updated = 0;

        db.prepare('BEGIN').run();

        for (const ingName of INGREDIENTS_TO_CLEAN) {
            const ing = db.prepare('SELECT id, name, tags FROM Ingredients WHERE name = ?').get(ingName);

            if (ing) {
                const tags = JSON.parse(ing.tags || '[]');

                if (tags.includes('base_oil')) {
                    const newTags = tags.filter(t => t !== 'base_oil');
                    const newTagsJson = JSON.stringify(newTags);

                    db.prepare('UPDATE Ingredients SET tags = ? WHERE id = ?').run(newTagsJson, ing.id);
                    updated++;
                    console.log(`  ✅ ${ingName}: rimosso base_oil`);
                    console.log(`     Tags: [${tags.join(', ')}] → [${newTags.join(', ') || 'nessuno'}]`);
                }
            }
        }

        db.prepare('COMMIT').run();
        console.log(`\n✅ SQLite: ${updated} ingredienti puliti\n`);
        db.close();

    } catch (error) {
        db.prepare('ROLLBACK').run();
        db.close();
        console.error('❌ Errore SQLite:', error.message);
    }
}

async function cleanTurso() {
    console.log('='.repeat(80));
    console.log('📍 TURSO (PRODUZIONE)\n');

    const turso = createClient({
        url: tursoUrl,
        authToken: tursoToken,
    });

    try {
        let updated = 0;

        for (const ingName of INGREDIENTS_TO_CLEAN) {
            const result = await turso.execute({
                sql: 'SELECT id, name, tags FROM Ingredients WHERE name = ?',
                args: [ingName]
            });

            if (result.rows.length > 0) {
                const ing = result.rows[0];
                const tags = JSON.parse(ing.tags || '[]');

                if (tags.includes('base_oil')) {
                    const newTags = tags.filter(t => t !== 'base_oil');
                    const newTagsJson = JSON.stringify(newTags);

                    await turso.execute({
                        sql: 'UPDATE Ingredients SET tags = ? WHERE id = ?',
                        args: [newTagsJson, ing.id]
                    });

                    updated++;
                    console.log(`  ✅ ${ingName}: rimosso base_oil`);
                    console.log(`     Tags: [${tags.join(', ')}] → [${newTags.join(', ') || 'nessuno'}]`);
                }
            }
        }

        console.log(`\n✅ Turso: ${updated} ingredienti puliti\n`);

    } catch (error) {
        console.error('❌ Errore Turso:', error.message);
    }
}

async function main() {
    cleanSQLite();
    await cleanTurso();

    console.log('='.repeat(80));
    console.log('\n🎉 PULIZIA COMPLETATA!');
    console.log('\nIngredienti che dovrebbero avere base_oil:');
    console.log('  ✅ Olio EVO aromatizzato');
    console.log('  ✅ Olio al tartufo');
    console.log('  ✅ Olio EVO\n');
    console.log('Tutti gli altri non dovrebbero più averlo!\n');
    console.log('='.repeat(80) + '\n');
}

main();
