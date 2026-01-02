// Sync categories AND ingredients from SQLite to Turso WITH ORIGINAL IDs
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const sqliteDb = new Database(path.join(__dirname, '../antigravipizza.db'), { readonly: true });
const tursoDb = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function syncAll() {
    console.log('=== Full Sync: Categories + Ingredients ===\n');

    try {
        // STEP 1: Sync Categories with original IDs
        console.log('📂 Syncing Categories...');
        const categories = sqliteDb.prepare('SELECT * FROM Categories').all();

        for (const cat of categories) {
            await tursoDb.execute({
                sql: `INSERT INTO Categories (id, name, displayOrder, icon, createdAt)
                      VALUES (?, ?, ?, ?, ?)`,
                args: [cat.id, cat.name, cat.displayOrder, cat.icon, cat.createdAt || new Date().toISOString()]
            });
        }
        console.log(`✅ Synced ${categories.length} categories\n`);

        // STEP 2: Sync Ingredients with original IDs
        console.log('🥬 Syncing Ingredients...');
        const ingredients = sqliteDb.prepare('SELECT * FROM Ingredients').all();

        let synced = 0;
        for (const ing of ingredients) {
            try {
                await tursoDb.execute({
                    sql: `INSERT INTO Ingredients 
                          (id, name, categoryId, subcategory, minWeight, maxWeight, 
                           defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [
                        ing.id,
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
                if (synced % 50 === 0) console.log(`  ✓ ${synced}/${ingredients.length}...`);
            } catch (error) {
                console.error(`  ✗ ${ing.name}:`, error.message);
            }
        }
        console.log(`✅ Synced ${synced}/${ingredients.length} ingredients\n`);

        // Verification
        const catCount = await tursoDb.execute('SELECT COUNT(*) as c FROM Categories');
        const ingCount = await tursoDb.execute('SELECT COUNT(*) as c FROM Ingredients');

        console.log('=== Verification ===');
        console.log(`Categories in Turso: ${catCount.rows[0].c}`);
        console.log(`Ingredients in Turso: ${ingCount.rows[0].c}`);

        console.log('\n✅ Full sync completed!');

    } catch (error) {
        console.error('❌ Sync failed:', error);
    } finally {
        sqliteDb.close();
    }
}

syncAll();
