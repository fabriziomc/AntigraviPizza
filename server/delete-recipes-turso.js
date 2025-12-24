// Delete all recipes from Turso database
// Preserves guests and pizza night events
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

async function deleteRecipes() {
    console.log('=== Eliminazione Pizze da Turso Database ===\n');

    try {
        // Check current counts
        const recipeCountBefore = await tursoDb.execute('SELECT COUNT(*) as c FROM Recipes');
        const guestCount = await tursoDb.execute('SELECT COUNT(*) as c FROM Guests');
        const nightCount = await tursoDb.execute('SELECT COUNT(*) as c FROM PizzaNights');

        console.log('📊 Stato attuale:');
        console.log(`   Ricette (Pizze): ${recipeCountBefore.rows[0].c}`);
        console.log(`   Ospiti: ${guestCount.rows[0].c}`);
        console.log(`   Serate: ${nightCount.rows[0].c}\n`);

        // Delete all recipes
        console.log('🗑️  Cancellazione di tutte le ricette...');
        await tursoDb.execute('DELETE FROM Recipes');

        // Verify deletion
        const recipeCountAfter = await tursoDb.execute('SELECT COUNT(*) as c FROM Recipes');
        const guestCountAfter = await tursoDb.execute('SELECT COUNT(*) as c FROM Guests');
        const nightCountAfter = await tursoDb.execute('SELECT COUNT(*) as c FROM PizzaNights');

        console.log('\n✅ Operazione completata!\n');
        console.log('📊 Stato finale:');
        console.log(`   Ricette (Pizze): ${recipeCountAfter.rows[0].c} (eliminate: ${recipeCountBefore.rows[0].c})`);
        console.log(`   Ospiti: ${guestCountAfter.rows[0].c} (mantenuti)`);
        console.log(`   Serate: ${nightCountAfter.rows[0].c} (mantenute)\n`);

        if (guestCountAfter.rows[0].c !== guestCount.rows[0].c ||
            nightCountAfter.rows[0].c !== nightCount.rows[0].c) {
            console.warn('⚠️  ATTENZIONE: Il numero di ospiti o serate è cambiato inaspettatamente!');
        } else {
            console.log('✅ Ospiti e serate preservati correttamente!');
        }

    } catch (error) {
        console.error('❌ Errore durante eliminazione:', error);
        throw error;
    }
}

deleteRecipes();
