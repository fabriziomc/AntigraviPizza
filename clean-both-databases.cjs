// Script unificato per eliminare ingredienti errati da SQLite E Turso
const Database = require('better-sqlite3').default || require('better-sqlite3');
const { createClient } = require('@libsql/client');

// Carica le credenziali Turso dal file .env.backup
const fs = require('fs');
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

// ID degli ingredienti errati da eliminare
const errorIds = [
    'e0eeeaa7-4da6-4f4c-aa2e-8885c41c258a', // soffriggere nell'olio il sedano
    '804b0852-1ef0-4a34-84cf-99abca9cf955'  // 100 gr di farina di castagne
];

console.log('\n' + '='.repeat(80));
console.log('ELIMINAZIONE INGREDIENTI ERRATI DA SQLITE E TURSO');
console.log('='.repeat(80) + '\n');

// ========== PARTE 1: SQLITE ==========
console.log('📍 FASE 1: ELIMINAZIONE DA SQLITE LOCALE\n');

function cleanSQLite() {
    const db = new Database('./antigravipizza.db');

    try {
        console.log('Ingredienti da eliminare:\n');
        errorIds.forEach((id, index) => {
            const ing = db.prepare('SELECT name FROM Ingredients WHERE id = ?').get(id);
            if (ing) {
                console.log(`  ${index + 1}. "${ing.name}" (ID: ${id})`);
            } else {
                console.log(`  ${index + 1}. ID ${id} - non presente`);
            }
        });

        console.log('\nInizio eliminazione...\n');

        db.prepare('BEGIN').run();

        let deleted = 0;
        errorIds.forEach(id => {
            const ing = db.prepare('SELECT name FROM Ingredients WHERE id = ?').get(id);
            if (ing) {
                const result = db.prepare('DELETE FROM Ingredients WHERE id = ?').run(id);
                if (result.changes > 0) {
                    deleted++;
                    console.log(`  ✅ Eliminato: "${ing.name}"`);
                }
            }
        });

        db.prepare('COMMIT').run();

        console.log(`\n✅ SQLite: Eliminati ${deleted}/${errorIds.length} ingredienti\n`);

        const total = db.prepare('SELECT COUNT(*) as count FROM Ingredients').get();
        console.log(`Ingredienti rimanenti in SQLite: ${total.count}\n`);

        db.close();
        return deleted;

    } catch (error) {
        db.prepare('ROLLBACK').run();
        db.close();
        console.error(`❌ Errore SQLite: ${error.message}\n`);
        return 0;
    }
}

// ========== PARTE 2: TURSO ==========
async function cleanTurso() {
    console.log('='.repeat(80));
    console.log('📍 FASE 2: ELIMINAZIONE DA TURSO (PRODUZIONE)\n');

    if (!tursoUrl || !tursoToken) {
        console.log('⚠️  Credenziali Turso non trovate in .env.backup');
        console.log('   Salto la pulizia di Turso.\n');
        return 0;
    }

    const turso = createClient({
        url: tursoUrl,
        authToken: tursoToken,
    });

    try {
        console.log('Connesso a Turso...\n');
        console.log('Ingredienti da eliminare:\n');

        for (let i = 0; i < errorIds.length; i++) {
            const id = errorIds[i];
            const result = await turso.execute({
                sql: 'SELECT name FROM Ingredients WHERE id = ?',
                args: [id]
            });

            if (result.rows.length > 0) {
                console.log(`  ${i + 1}. "${result.rows[0].name}" (ID: ${id})`);
            } else {
                console.log(`  ${i + 1}. ID ${id} - non presente`);
            }
        }

        console.log('\nInizio eliminazione...\n');

        let deleted = 0;
        for (const id of errorIds) {
            const checkResult = await turso.execute({
                sql: 'SELECT name FROM Ingredients WHERE id = ?',
                args: [id]
            });

            if (checkResult.rows.length > 0) {
                const name = checkResult.rows[0].name;

                await turso.execute({
                    sql: 'DELETE FROM Ingredients WHERE id = ?',
                    args: [id]
                });

                deleted++;
                console.log(`  ✅ Eliminato: "${name}"`);
            }
        }

        console.log(`\n✅ Turso: Eliminati ${deleted}/${errorIds.length} ingredienti\n`);

        const totalResult = await turso.execute('SELECT COUNT(*) as count FROM Ingredients');
        console.log(`Ingredienti rimanenti in Turso: ${totalResult.rows[0].count}\n`);

        return deleted;

    } catch (error) {
        console.error(`❌ Errore Turso: ${error.message}\n`);
        return 0;
    }
}

// ========== ESECUZIONE ==========
async function main() {
    const sqliteDeleted = cleanSQLite();
    const tursoDeleted = await cleanTurso();

    console.log('='.repeat(80));
    console.log('\n📊 RIEPILOGO FINALE\n');
    console.log(`  SQLite: ${sqliteDeleted} ingredienti eliminati`);
    console.log(`  Turso:  ${tursoDeleted} ingredienti eliminati`);
    console.log(`\n  Totale: ${sqliteDeleted + tursoDeleted} ingredienti eliminati\n`);
    console.log('='.repeat(80) + '\n');
}

main().catch(console.error);
