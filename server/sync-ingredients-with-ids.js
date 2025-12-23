// Sync ingredients from SQLite to Turso WITH ORIGINAL IDs
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Connect to SQLite
const sqliteDb = new Database(path.join(__dirname, '../antigravipizza.db'), { readonly: true });

// Connect to Turso
const tursoDb = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function syncIngredientsWithIds() {
    console.log('=== Syncing Ingredients to Turso (with IDs) ===\n');

    try {
        // Get all ingredients from SQLite
        const ingredients = sqliteDb.prepare('SELECT * FROM Ingredients').all();
        console.log(`Found ${ingredients.length} ingredients in SQLite\n`);

        let synced = 0;
        let errors = 0;

        for (const ing of ingredients) {
            try {
                // Insert with ORIGINAL ID from SQLite
                await tursoDb.execute({
                    sql: `INSERT INTO Ingredients 
                          (id, name, categoryId, subcategory, minWeight, maxWeight, 
                           defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [
                        ing.id,  // ✅ USO L'ID ORIGINALE!
                        ing.name,
                        ing.categoryId,
                        ing.subcategory,
                        ing.minWeight,
                        ing.maxWeight,
                        ing.defaultUnit,
                        ing.postBake || 0,
                        ing.phase,
                        ing.season,
                        ing.allergens,
                        ing.tags,
                        ing.isCustom || 0,
                        ing.dateAdded || new Date().toISOString()
                    ]
                });
                synced++;
                if (synced % 50 === 0) {
                    console.log(`✓ Synced ${synced}/${ingredients.length}...`);
                }
            } catch (error) {
                console.error(`✗ Error with ${ing.name}:`, error.message);
                errors++;
            }
        }

        console.log('\n=== Sync Summary ===');
        console.log(`Successfully synced: ${synced}`);
        console.log(`Errors: ${errors}`);

        // Verify total count
        const tursoCount = await tursoDb.execute('SELECT COUNT(*) as count FROM Ingredients');
        console.log(`\nTotal ingredients in Turso: ${tursoCount.rows[0].count}`);

        // Verify a specific ID
        console.log('\n=== Verification ===');
        const testId = 'c532efc7-fef0-41d0-bc7c-91d198ccb9d0'; // Panna fresca
        const test = await tursoDb.execute({
            sql: 'SELECT name FROM Ingredients WHERE id = ?',
            args: [testId]
        });

        if (test.rows.length > 0) {
            console.log(`✅ Test ID ${testId.substring(0, 16)}... → ${test.rows[0].name}`);
        } else {
            console.log(`❌ Test ID not found!`);
        }

        console.log('\n✅ Sync completed!');

    } catch (error) {
        console.error('❌ Sync failed:', error);
        throw error;
    } finally {
        sqliteDb.close();
    }
}

syncIngredientsWithIds();
