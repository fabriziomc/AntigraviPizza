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

async function testIngredientIds() {
    console.log('=== Test random ingredientId ===\n');

    const preps = await tursoDb.execute('SELECT name, ingredients FROM Preparations LIMIT 10');

    let totalIngredients = 0;
    let foundIngredients = 0;
    let notFoundIds = new Set();

    for (const prep of preps.rows) {
        const ingredients = JSON.parse(prep.ingredients);

        for (const ing of ingredients) {
            if (ing.ingredientId) {
                totalIngredients++;

                const result = await tursoDb.execute({
                    sql: 'SELECT name FROM Ingredients WHERE id = ?',
                    args: [ing.ingredientId]
                });

                if (result.rows.length > 0) {
                    foundIngredients++;
                } else {
                    notFoundIds.add(ing.ingredientId);
                    console.log(`❌ NOT FOUND: ${ing.ingredientId} in "${prep.name}"`);
                }
            }
        }
    }

    console.log(`\n=== RISULTATI ===`);
    console.log(`Ingredienti testati: ${totalIngredients}`);
    console.log(`Trovati: ${foundIngredients}`);
    console.log(`NON trovati: ${notFoundIds.size}`);

    if (notFoundIds.size > 0) {
        console.log(`\n❌ PROBLEMA: Ci sono ancora ${notFoundIds.size} ID che non esistono!`);
        console.log('IDs mancanti:', Array.from(notFoundIds).slice(0, 5));
    } else {
        console.log(`\n✅ TUTTO OK! Tutti gli ingredient IDs esistono`);
    }
}

testIngredientIds().catch(console.error);
