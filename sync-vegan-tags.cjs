const Database = require('better-sqlite3').default || require('better-sqlite3');
const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== SINCRONIZZAZIONE TAG VEGANA ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

// ========== PARTE 1: SQLITE ==========
console.log('📍 FASE 1: SQLITE LOCALE\n');

function fixSQLite() {
    const db = new Database('./antigravipizza.db');

    try {
        // Trova pizze con archetypeUsed='vegana' senza tag "Vegana"
        const veganPizzas = db.prepare(`
      SELECT id, name, tags
      FROM Recipes
      WHERE archetypeUsed = 'vegana'
    `).all();

        console.log(`Trovate ${veganPizzas.length} pizze con archetype vegana\n`);

        if (veganPizzas.length === 0) {
            console.log('Nessuna pizza da aggiornare in SQLite\n');
            db.close();
            return 0;
        }

        let updated = 0;
        db.prepare('BEGIN').run();

        veganPizzas.forEach(pizza => {
            try {
                const tags = JSON.parse(pizza.tags || '[]');

                if (!tags.includes('Vegana')) {
                    tags.push('Vegana');
                    const newTags = JSON.stringify(tags);

                    db.prepare('UPDATE Recipes SET tags = ? WHERE id = ?').run(newTags, pizza.id);
                    updated++;
                    console.log(`  ✅ ${pizza.name}: aggiunto tag "Vegana"`);
                } else {
                    console.log(`  ℹ️  ${pizza.name}: tag già presente`);
                }
            } catch (e) {
                console.error(`  ❌ Errore con ${pizza.name}: ${e.message}`);
            }
        });

        db.prepare('COMMIT').run();
        console.log(`\n✅ SQLite: Aggiornate ${updated}/${veganPizzas.length} pizze\n`);

        db.close();
        return updated;

    } catch (error) {
        db.prepare('ROLLBACK').run();
        db.close();
        console.error(`❌ Errore SQLite: ${error.message}\n`);
        return 0;
    }
}

// ========== PARTE 2: TURSO ==========
async function fixTurso() {
    console.log('='.repeat(80));
    console.log('📍 FASE 2: TURSO (PRODUZIONE)\n');

    const turso = createClient({
        url: tursoUrl,
        authToken: tursoToken,
    });

    try {
        // Trova pizze con archetypeUsed='vegana'
        const result = await turso.execute({
            sql: 'SELECT id, name, tags FROM Recipes WHERE archetypeUsed = ?',
            args: ['vegana']
        });

        console.log(`Trovate ${result.rows.length} pizze con archetype vegana\n`);

        if (result.rows.length === 0) {
            console.log('Nessuna pizza da aggiornare in Turso\n');
            return 0;
        }

        let updated = 0;

        for (const pizza of result.rows) {
            try {
                const tags = JSON.parse(pizza.tags || '[]');

                if (!tags.includes('Vegana')) {
                    tags.push('Vegana');
                    const newTags = JSON.stringify(tags);

                    await turso.execute({
                        sql: 'UPDATE Recipes SET tags = ? WHERE id = ?',
                        args: [newTags, pizza.id]
                    });

                    updated++;
                    console.log(`  ✅ ${pizza.name}: aggiunto tag "Vegana"`);
                } else {
                    console.log(`  ℹ️  ${pizza.name}: tag già presente`);
                }
            } catch (e) {
                console.error(`  ❌ Errore con ${pizza.name}: ${e.message}`);
            }
        }

        console.log(`\n✅ Turso: Aggiornate ${updated}/${result.rows.length} pizze\n`);
        return updated;

    } catch (error) {
        console.error(`❌ Errore Turso: ${error.message}\n`);
        return 0;
    }
}

// ========== ESECUZIONE ==========
async function main() {
    const sqliteUpdated = fixSQLite();
    const tursoUpdated = await fixTurso();

    console.log('='.repeat(80));
    console.log('\n📊 RIEPILOGO FINALE\n');
    console.log(`  SQLite: ${sqliteUpdated} pizze aggiornate`);
    console.log(`  Turso:  ${tursoUpdated} pizze aggiornate`);
    console.log(`\n  Totale: ${sqliteUpdated + tursoUpdated} pizze ora hanno il tag "Vegana"\n`);
    console.log('✅ Ora il filtro "Vegana" dovrebbe funzionare correttamente!\n');
    console.log('='.repeat(80) + '\n');
}

main().catch(console.error);
