const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== RICERCA ESATTA PER NOMI INGREDIENTI ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

async function searchByExactNames() {
    try {
        console.log('Cerco ingredienti con nomi specifici...\n');

        const searchNames = [
            'frullare mango con olio',
            '1 bicchiere di latte e 1 di acqua',
            '%frullare%mango%',
            '%bicchiere%latte%',
            '%bicchiere%acqua%'
        ];

        const foundIngredients = new Map();

        for (const name of searchNames) {
            const result = await turso.execute({
                sql: 'SELECT id, name, categoryId FROM Ingredients WHERE LOWER(name) LIKE LOWER(?)',
                args: [name]
            });

            if (result.rows.length > 0) {
                console.log(`📌 Pattern: "${name}"`);
                result.rows.forEach(ing => {
                    console.log(`   ✓ TROVATO: "${ing.name}"`);
                    console.log(`     ID: ${ing.id}`);
                    console.log(`     Categoria: ${ing.categoryId}\n`);

                    if (!foundIngredients.has(ing.id)) {
                        foundIngredients.set(ing.id, ing);
                    }
                });
            }
        }

        console.log('='.repeat(80));
        console.log('\n📋 RIEPILOGO FINALE\n');

        if (foundIngredients.size > 0) {
            console.log(`Totale ingredienti trovati: ${foundIngredients.size}\n`);

            Array.from(foundIngredients.values()).forEach((ing, idx) => {
                console.log(`${idx + 1}. "${ing.name}"`);
                console.log(`   ID: ${ing.id}\n`);
            });

            console.log('\n=== ID DA ELIMINARE ===\n');
            const ids = Array.from(foundIngredients.keys());
            ids.forEach(id => console.log(`'${id}',`));
            console.log('\n');

            // Chiediamo conferma se sono davvero errati
            console.log('⚠️  Verificare che questi siano effettivamente ingredienti ERRATI prima di eliminarli!\n');

        } else {
            console.log('❌ Nessun ingrediente trovato con questi pattern.\n');
            console.log('Possibilità:');
            console.log('  1. Gli ingredienti sono già stati eliminati');
            console.log('  2. I nomi sono leggermente diversi');
            console.log('  3. C\'è un problema di cache su Render\n');
        }

    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

searchByExactNames();
