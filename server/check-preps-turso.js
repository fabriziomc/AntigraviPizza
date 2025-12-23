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

async function checkPreparations() {
    const count = await tursoDb.execute('SELECT COUNT(*) as c FROM Preparations');
    console.log(`Preparations in Turso: ${count.rows[0].c}`);

    const preps = await tursoDb.execute('SELECT id, name, category, ingredients FROM Preparations LIMIT 3');
    console.log('\nSample preparations:');
    for (const p of preps.rows) {
        console.log(`\n${p.name} (${p.category})`);
        console.log(`  ID: ${p.id}`);
        const ings = JSON.parse(p.ingredients);
        console.log(`  Ingredients: ${ings.length} items`);
        if (ings.length > 0 && ings[0].ingredientId) {
            console.log(`  First ing ID: ${ings[0].ingredientId.substring(0, 16)}...`);
        }
    }
}

checkPreparations();
