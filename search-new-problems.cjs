const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== RICERCA PROBLEMI AGGIUNTIVI IN TURSO ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

async function searchProblems() {
    try {
        // PROBLEMA 1: Cerca "la carota e la cipolla"
        console.log('🔍 PROBLEMA 1: Cerca "la carota e la cipolla"\n');

        const result1 = await turso.execute({
            sql: 'SELECT id, name, categoryId FROM Ingredients WHERE LOWER(name) LIKE LOWER(?)',
            args: ['%carota%cipolla%']
        });

        if (result1.rows.length > 0) {
            console.log('✓ TROVATO:\n');
            result1.rows.forEach(ing => {
                console.log(`   Nome: "${ing.name}"`);
                console.log(`   ID: ${ing.id}`);
                console.log(`   Categoria: ${ing.categoryId}\n`);
            });
        } else {
            console.log('   Non trovato con questo pattern, cerco varianti...\n');

            const result2 = await turso.execute({
                sql: 'SELECT id, name, categoryId FROM Ingredients WHERE LOWER(name) LIKE ? OR LOWER(name) LIKE ?',
                args: ['%la carota%', '%la cipolla%']
            });

            if (result2.rows.length > 0) {
                console.log('✓ Trovati ingredienti con "la carota" o "la cipolla":\n');
                result2.rows.forEach(ing => {
                    console.log(`   - "${ing.name}" (ID: ${ing.id})`);
                });
                console.log('');
            }
        }

        // PROBLEMA 2: Cerca ingredienti dolci in categoria "Erbe e Spezie"
        console.log('='.repeat(80));
        console.log('\n🔍 PROBLEMA 2: Ingredienti dolci in "Erbe e Spezie"\n');

        // Prima trova l'ID della categoria "Erbe e Spezie"
        const catResult = await turso.execute({
            sql: 'SELECT id, name FROM Categories WHERE LOWER(name) LIKE ?',
            args: ['%erbe%spezie%']
        });

        if (catResult.rows.length > 0) {
            const categoryId = catResult.rows[0].id;
            const categoryName = catResult.rows[0].name;

            console.log(`Categoria trovata: "${categoryName}" (ID: ${categoryId})\n`);

            // Ottieni tutti gli ingredienti in questa categoria
            const ingResult = await turso.execute({
                sql: 'SELECT id, name FROM Ingredients WHERE categoryId = ? ORDER BY name',
                args: [categoryId]
            });

            console.log(`Totale ingredienti in questa categoria: ${ingResult.rows.length}\n`);

            // Parole chiave che indicano ingredienti dolci
            const sweetKeywords = [
                'miele', 'zucchero', 'cioccolat', 'caramell', 'nutella',
                'confettura', 'marmellat', 'scaglie', 'crema', 'dolce',
                'fragol', 'banana', 'pera', 'mela', 'arancia', 'limone',
                'vaniglia', 'cannella'
            ];

            const sweetIngredients = ingResult.rows.filter(ing => {
                const name = ing.name.toLowerCase();
                return sweetKeywords.some(keyword => name.includes(keyword));
            });

            if (sweetIngredients.length > 0) {
                console.log(`❗ Trovati ${sweetIngredients.length} ingredienti dolci in "Erbe e Spezie":\n`);
                sweetIngredients.forEach((ing, idx) => {
                    console.log(`   ${idx + 1}. "${ing.name}" (ID: ${ing.id})`);
                });
                console.log('');
            } else {
                console.log('   Nessun ingrediente dolce ovvio trovato.\n');
            }

            // Mostra tutti gli ingredienti per revisione manuale
            console.log('\n📋 LISTA COMPLETA ingredienti in "Erbe e Spezie":\n');
            ingResult.rows.forEach((ing, idx) => {
                console.log(`   ${idx + 1}. ${ing.name}`);
            });
            console.log('');

        } else {
            console.log('   Categoria "Erbe e Spezie" non trovata!\n');
        }

    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

searchProblems();
