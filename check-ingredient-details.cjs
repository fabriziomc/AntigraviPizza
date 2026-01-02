const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== DETTAGLI INGREDIENTI TROVATI IN TURSO ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

// ID trovati dalla ricerca precedente
const idsToCheck = [
    '7c732356-744b-4ac9-bac4-2900ad5fd158',
    'd0716fa6-8046-4816-8ecc-b4cfa0fcc141',
    '0440272f-a0e6-4e83-95b4-95056184e746',
    'b97353ad-28b9-4aa7-af53-c7f87c289909'
];

async function checkIngredients() {
    try {
        console.log('Recupero dettagli completi...\n');

        for (let i = 0; i < idsToCheck.length; i++) {
            const id = idsToCheck[i];
            const result = await turso.execute({
                sql: 'SELECT * FROM Ingredients WHERE id = ?',
                args: [id]
            });

            if (result.rows.length > 0) {
                const ing = result.rows[0];
                console.log(`[${i + 1}] ID: ${id}`);
                console.log(`    Nome: "${ing.name}"`);
                console.log(`    Categoria: ${ing.categoryId}`);
                if (ing.tags) console.log(`    Tags: ${ing.tags}`);
                console.log('');
            } else {
                console.log(`[${i + 1}] ID: ${id} - NON TROVATO\n`);
            }
        }

    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

checkIngredients();
