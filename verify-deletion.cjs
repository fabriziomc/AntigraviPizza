const Database = require('better-sqlite3').default || require('better-sqlite3');
const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== VERIFICA ELIMINAZIONE ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

// ID degli ingredienti che dovrebbero essere stati eliminati
const deletedIds = [
    'e0eeeaa7-4da6-4f4c-aa2e-8885c41c258a',
    '804b0852-1ef0-4a34-84cf-99abca9cf955'
];

// Verifica SQLite
console.log('📍 VERIFICA SQLITE LOCALE\n');
const db = new Database('./antigravipizza.db');

let foundInSqlite = 0;
deletedIds.forEach(id => {
    const result = db.prepare('SELECT name FROM Ingredients WHERE id = ?').get(id);
    if (result) {
        console.log(`  ❌ ANCORA PRESENTE: "${result.name}" (ID: ${id})`);
        foundInSqlite++;
    }
});

if (foundInSqlite === 0) {
    console.log('  ✅ Tutti gli ingredienti errati sono stati eliminati da SQLite\n');
}

const totalSqlite = db.prepare('SELECT COUNT(*) as count FROM Ingredients').get();
console.log(`  Totale ingredienti in SQLite: ${totalSqlite.count}\n`);

db.close();

// Verifica Turso
async function verifyTurso() {
    console.log('='.repeat(80));
    console.log('📍 VERIFICA TURSO (PRODUZIONE)\n');

    if (!tursoUrl || !tursoToken) {
        console.log('  ⚠️ Credenziali Turso non disponibili, salto verifica\n');
        return;
    }

    const turso = createClient({
        url: tursoUrl,
        authToken: tursoToken,
    });

    try {
        let foundInTurso = 0;

        for (const id of deletedIds) {
            const result = await turso.execute({
                sql: 'SELECT name FROM Ingredients WHERE id = ?',
                args: [id]
            });

            if (result.rows.length > 0) {
                console.log(`  ❌ ANCORA PRESENTE: "${result.rows[0].name}" (ID: ${id})`);
                foundInTurso++;
            }
        }

        if (foundInTurso === 0) {
            console.log('  ✅ Tutti gli ingredienti errati sono stati eliminati da Turso\n');
        }

        const totalResult = await turso.execute('SELECT COUNT(*) as count FROM Ingredients');
        console.log(`  Totale ingredienti in Turso: ${totalResult.rows[0].count}\n`);

        console.log('='.repeat(80));
        console.log('\n✅ VERIFICA COMPLETATA CON SUCCESSO!\n');

    } catch (error) {
        console.error(`  ❌ Errore durante verifica Turso: ${error.message}\n`);
    }
}

verifyTurso();
