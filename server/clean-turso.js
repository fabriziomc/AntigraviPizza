// Clean Turso database - delete all ingredients and preparations
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

async function cleanTurso() {
    console.log('=== Pulizia Turso Database ===\n');

    try {
        // Delete preparations first (foreign key constraints)
        console.log('🗑️  Cancellazione preparazioni...');
        await tursoDb.execute('DELETE FROM Preparations');
        const prepCount = await tursoDb.execute('SELECT COUNT(*) as c FROM Preparations');
        console.log(`✅ Preparazioni rimanenti: ${prepCount.rows[0].c}\n`);

        // Delete ingredients
        console.log('🗑️  Cancellazione ingredienti...');
        await tursoDb.execute('DELETE FROM Ingredients');
        const ingCount = await tursoDb.execute('SELECT COUNT(*) as c FROM Ingredients');
        console.log(`✅ Ingredienti rimanenti: ${ingCount.rows[0].c}\n`);

        // Keep categories (they're correct)
        const catCount = await tursoDb.execute('SELECT COUNT(*) as c FROM Categories');
        console.log(`ℹ️  Categorie mantenute: ${catCount.rows[0].c}\n`);

        console.log('✅ Pulizia completata!');

    } catch (error) {
        console.error('❌ Errore durante pulizia:', error);
        throw error;
    }
}

cleanTurso();
