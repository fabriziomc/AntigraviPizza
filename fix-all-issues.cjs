const Database = require('better-sqlite3').default || require('better-sqlite3');
const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n' + '='.repeat(80));
console.log('CORREZIONE INGREDIENTI ERRATI E CATEGORIE');
console.log('='.repeat(80) + '\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

// ID per le correzioni
const carrotOnionId = '27df6ff3-7b70-4cc6-942e-a68af3667371'; // la carota e la cipolla
const correctCategoryId = '32b1230e-f71b-4cfd-832c-05c9e411d143'; // Frutta e Frutta Secca

const sweetIngredientsIds = [
    'd99e7c63-2050-4a84-a104-3a1267ffcb50', // Fragole
    '55bd31d1-fdf2-4abf-8acd-ea53cd792fe9', // Limone grattugiato
    '3bb43731-d39e-4750-aaa1-ae5ff723a7d1', // Liquirizia in polvere
    'd8edb3f4-da6c-4072-9f81-59c10897dd36', // Miele di acacia
    'd70a8009-9ae5-4d8b-b5a5-9f7ee3ea2949', // Miele di castagno
    '51a34847-d060-4ec6-bfad-46e0647112f0', // Riduzione di balsamico
    '6487438a-18c0-4c0b-acee-58196c850919', // Scaglie di cioccolato
    '16bb5781-9b29-4950-9c78-6b5b91485cda'  // Scorzette di arancia
];

// ========== PARTE 1: SQLITE ==========
console.log('📍 FASE 1: CORREZIONI IN SQLITE LOCALE\n');

function fixSQLite() {
    const db = new Database('./antigravipizza.db');

    try {
        db.prepare('BEGIN').run();

        // 1. Elimina "la carota e la cipolla"
        console.log('1️⃣ Eliminazione ingrediente errato...\n');
        const toDelete = db.prepare('SELECT name FROM Ingredients WHERE id = ?').get(carrotOnionId);

        if (toDelete) {
            const deleteResult = db.prepare('DELETE FROM Ingredients WHERE id = ?').run(carrotOnionId);
            if (deleteResult.changes > 0) {
                console.log(`   ✅ Eliminato: "${toDelete.name}"\n`);
            }
        } else {
            console.log(`   ℹ️  Ingrediente non presente in SQLite\n`);
        }

        // 2. Sposta ingredienti dolci alla categoria corretta
        console.log('2️⃣ Ricategorizzazione ingredienti dolci...\n');
        let moved = 0;

        sweetIngredientsIds.forEach(id => {
            const ing = db.prepare('SELECT name, categoryId FROM Ingredients WHERE id = ?').get(id);
            if (ing) {
                const updateResult = db.prepare('UPDATE Ingredients SET categoryId = ? WHERE id = ?').run(correctCategoryId, id);
                if (updateResult.changes > 0) {
                    moved++;
                    console.log(`   ✅ Spostato: "${ing.name}"`);
                }
            }
        });

        console.log(`\n   Totale spostati: ${moved}\n`);

        db.prepare('COMMIT').run();

        const total = db.prepare('SELECT COUNT(*) as count FROM Ingredients').get();
        console.log(`Ingredienti totali in SQLite: ${total.count}\n`);

        db.close();
        return { deleted: toDelete ? 1 : 0, moved };

    } catch (error) {
        db.prepare('ROLLBACK').run();
        db.close();
        console.error(`❌ Errore SQLite: ${error.message}\n`);
        return { deleted: 0, moved: 0 };
    }
}

// ========== PARTE 2: TURSO ==========
async function fixTurso() {
    console.log('='.repeat(80));
    console.log('📍 FASE 2: CORREZIONI IN TURSO (PRODUZIONE)\n');

    const turso = createClient({
        url: tursoUrl,
        authToken: tursoToken,
    });

    try {
        // 1. Elimina "la carota e la cipolla"
        console.log('1️⃣ Eliminazione ingrediente errato...\n');

        const deleteCheck = await turso.execute({
            sql: 'SELECT name FROM Ingredients WHERE id = ?',
            args: [carrotOnionId]
        });

        if (deleteCheck.rows.length > 0) {
            const name = deleteCheck.rows[0].name;

            await turso.execute({
                sql: 'DELETE FROM Ingredients WHERE id = ?',
                args: [carrotOnionId]
            });

            console.log(`   ✅ Eliminato: "${name}"\n`);
        } else {
            console.log(`   ℹ️  Ingrediente non presente in Turso\n`);
        }

        // 2. Sposta ingredienti dolci
        console.log('2️⃣ Ricategorizzazione ingredienti dolci...\n');

        let moved = 0;
        for (const id of sweetIngredientsIds) {
            const checkResult = await turso.execute({
                sql: 'SELECT name FROM Ingredients WHERE id = ?',
                args: [id]
            });

            if (checkResult.rows.length > 0) {
                const name = checkResult.rows[0].name;

                await turso.execute({
                    sql: 'UPDATE Ingredients SET categoryId = ? WHERE id = ?',
                    args: [correctCategoryId, id]
                });

                moved++;
                console.log(`   ✅ Spostato: "${name}"`);
            }
        }

        console.log(`\n   Totale spostati: ${moved}\n`);

        const totalResult = await turso.execute('SELECT COUNT(*) as count FROM Ingredients');
        console.log(`Ingredienti totali in Turso: ${totalResult.rows[0].count}\n`);

        return { deleted: deleteCheck.rows.length > 0 ? 1 : 0, moved };

    } catch (error) {
        console.error(`❌ Errore Turso: ${error.message}\n`);
        return { deleted: 0, moved: 0 };
    }
}

// ========== ESECUZIONE ==========
async function main() {
    const sqliteResults = fixSQLite();
    const tursoResults = await fixTurso();

    console.log('='.repeat(80));
    console.log('\n📊 RIEPILOGO FINALE\n');
    console.log(`SQLite:`);
    console.log(`  - Ingredienti eliminati: ${sqliteResults.deleted}`);
    console.log(`  - Ingredienti ricategorizzati: ${sqliteResults.moved}\n`);
    console.log(`Turso:`);
    console.log(`  - Ingredienti eliminati: ${tursoResults.deleted}`);
    console.log(`  - Ingredienti ricategorizzati: ${tursoResults.moved}\n`);
    console.log('='.repeat(80) + '\n');
}

main().catch(console.error);
