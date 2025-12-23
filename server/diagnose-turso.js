import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const tursoDb = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function diagnose() {
    console.log('=== DIAGNOSI TURSO ===\n');

    // 1. Conta preparazioni
    const prepCount = await tursoDb.execute('SELECT COUNT(*) as count FROM Preparations');
    console.log(`Preparazioni in Turso: ${prepCount.rows[0].count}\n`);

    // 2. Mostra alcune preparazioni
    const preps = await tursoDb.execute('SELECT id, name, ingredients FROM Preparations LIMIT 5');
    console.log('Esempio preparazioni:');
    for (const prep of preps.rows) {
        console.log(`\n${prep.name}:`);
        console.log(`  ID: ${prep.id}`);
        console.log(`  Ingredients: ${prep.ingredients.substring(0, 100)}...`);
    }

    // 3. Verifica un ingredientId specifico
    console.log('\n=== Test ingredientId ===');
    const emulsion = await tursoDb.execute({
        sql: 'SELECT ingredients FROM Preparations WHERE name LIKE ?',
        args: ['%Emulsione%']
    });

    if (emulsion.rows.length > 0) {
        const ing = JSON.parse(emulsion.rows[0].ingredients)[0];
        if (ing && ing.ingredientId) {
            console.log(`ID in preparazione: ${ing.ingredientId}`);

            const exists = await tursoDb.execute({
                sql: 'SELECT name FROM Ingredients WHERE id = ?',
                args: [ing.ingredientId]
            });

            if (exists.rows.length > 0) {
                console.log(`✅ ID esiste: ${exists.rows[0].name}`);
            } else {
                console.log(`❌ ID NON ESISTE in tabella Ingredients!`);
            }
        }
    }

    // 4. Conta ingredienti
    const ingCount = await tursoDb.execute('SELECT COUNT(*) as count FROM Ingredients');
    console.log(`\n\nIngredienti in Turso: ${ingCount.rows[0].count}`);
}

diagnose().catch(console.error);
