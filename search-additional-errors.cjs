const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== RICERCA INGREDIENTI AGGIUNTIVI IN TURSO ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

async function searchIngredients() {
    try {
        console.log('Cerco ingredienti che contengono i pattern...\n');

        const searches = [
            { term: '%frullare%', label: 'Contenente "frullare"' },
            { term: '%mango%', label: 'Contenente "mango"' },
            { term: '%bicchiere%', label: 'Contenente "bicchiere"' },
            { term: '%latte%acqua%', label: 'Contenente "latte" e "acqua"' },
            { term: '%1 bicchiere%', label: 'Inizia con "1 bicchiere"' }
        ];

        const foundIngredients = new Map();

        for (const { term, label } of searches) {
            const result = await turso.execute({
                sql: 'SELECT id, name, categoryId FROM Ingredients WHERE LOWER(name) LIKE LOWER(?) ORDER BY name',
                args: [term]
            });

            if (result.rows.length > 0) {
                console.log(`📌 ${label}: ${result.rows.length} risultato/i`);
                result.rows.forEach(ing => {
                    console.log(`   - "${ing.name}"`);
                    console.log(`     ID: ${ing.id}`);
                    console.log(`     Categoria: ${ing.categoryId}\n`);

                    if (!foundIngredients.has(ing.id)) {
                        foundIngredients.set(ing.id, ing);
                    }
                });
            }
        }

        console.log('='.repeat(80));
        console.log('\n📋 RIEPILOGO INGREDIENTI TROVATI\n');

        if (foundIngredients.size > 0) {
            console.log(`Totale: ${foundIngredients.size} ingredienti unici\n`);

            Array.from(foundIngredients.values()).forEach((ing, idx) => {
                console.log(`${idx + 1}. "${ing.name}"`);
                console.log(`   ID: ${ing.id}`);
                console.log(`   Categoria: ${ing.categoryId}\n`);
            });

            console.log('\n=== ID DA ELIMINARE ===\n');
            const ids = Array.from(foundIngredients.keys());
            console.log(ids.map(id => `'${id}'`).join(',\n'));
            console.log('\n');
        } else {
            console.log('Nessun ingrediente trovato con i pattern specificati.\n');
        }

    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

searchIngredients();
