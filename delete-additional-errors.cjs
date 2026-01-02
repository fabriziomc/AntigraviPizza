const Database = require('better-sqlite3').default || require('better-sqlite3');
const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== ELIMINAZIONE INGREDIENTI AGGIUNTIVI ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

// ID trovati dalla ricerca
const idsToDelete = [
    '7c732356-744b-4ac9-bac4-2900ad5fd158',
    'd0716fa6-8046-4816-8ecc-b4cfa0fcc141',
    '0440272f-a0e6-4e83-95b4-95056184e746',
    'b97353ad-28b9-4aa7-af53-c7f87c289909'
];

// ========== PARTE 1: SQLITE ==========
console.log('📍 FASE 1: ELIMINAZIONE DA SQLITE LOCALE\n');

function cleanSQLite() {
    const db = new Database('./antigravipizza.db');

    try {
        console.log('Controllo presenza in SQLite...\n');

        let found = [];
        idsToDelete.forEach((id, index) => {
            const ing = db.prepare('SELECT name FROM Ingredients WHERE id = ?').get(id);
            if (ing) {
                console.log(`  ${index + 1}. "${ing.name}" (ID: ${id})`);
                found.push({ id, name: ing.name });
            }
        });

        if (found.length === 0) {
            console.log('  Nessuno di questi ingredienti è presente in SQLite\n');
            db.close();
            return 0;
        }

        console.log(`\nInizio eliminazione di ${found.length} ingredienti...\n`);

        db.prepare('BEGIN').run();

        let deleted = 0;
        found.forEach(({ id, name }) => {
            const result = db.prepare('DELETE FROM Ingredients WHERE id = ?').run(id);
            if (result.changes > 0) {
                deleted++;
                console.log(`  ✅ Eliminato: "${name}"`);
            }
        });

        db.prepare('COMMIT').run();

        console.log(`\n✅ SQLite: Eliminati ${deleted} ingredienti\n`);

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

    const turso = createClient({
        url: tursoUrl,
        authToken: tursoToken,
    });

    try {
        console.log('Controllo presenza in Turso...\n');

        const found = [];
        for (const id of idsToDelete) {
            const result = await turso.execute({
                sql: 'SELECT name FROM Ingredients WHERE id = ?',
                args: [id]
            });

            if (result.rows.length > 0) {
                const name = result.rows[0].name;
                console.log(`  - "${name}"`);
                console.log(`    ID: ${id}\n`);
                found.push({ id, name });
            }
        }

        if (found.length === 0) {
            console.log('  Nessuno di questi ingredienti è presente in Turso\n');
            return 0;
        }

        console.log(`Inizio eliminazione di ${found.length} ingredienti...\n`);

        let deleted = 0;
        for (const { id, name } of found) {
            await turso.execute({
                sql: 'DELETE FROM Ingredients WHERE id = ?',
                args: [id]
            });

            deleted++;
            console.log(`  ✅ Eliminato: "${name}"`);
        }

        console.log(`\n✅ Turso: Eliminati ${deleted} ingredienti\n`);

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
