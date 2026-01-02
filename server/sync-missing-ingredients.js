// Sync missing ingredients to Turso (those that failed before)
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// SQLite local database
const sqliteDbPath = path.join(__dirname, '../antigravipizza.db');
const sqliteDb = new Database(sqliteDbPath);

// Turso
const tursoDb = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function syncMissingIngredients() {
    console.log('=== Syncing Missing Ingredients ===\n');

    // Get all ingredients from SQLite
    const sqliteIngredients = sqliteDb.prepare('SELECT * FROM Ingredients ORDER BY name').all();
    console.log(`SQLite ingredients: ${sqliteIngredients.length}`);

    // Get existing ingredients from Turso
    const tursoIngredients = await tursoDb.execute('SELECT name FROM Ingredients');
    const tursoNames = new Set(tursoIngredients.rows.map(r => r.name));
    console.log(`Turso ingredients: ${tursoNames.size}`);

    // Find missing ingredients
    const missing = sqliteIngredients.filter(ing => !tursoNames.has(ing.name));
    console.log(`Missing ingredients: ${missing.length}\n`);

    if (missing.length === 0) {
        console.log('✅ All ingredients already synced!');
        return;
    }

    // Get category mapping from Turso (to ensure correct categoryId)
    const tursoCategories = await tursoDb.execute('SELECT id, name FROM Categories');
    const categoryIdMap = {};
    tursoCategories.rows.forEach(cat => {
        categoryIdMap[cat.name] = cat.id;
    });

    console.log('Syncing missing ingredients:\n');

    let synced = 0;
    let errors = 0;

    for (const ing of missing) {
        // Get category name from SQLite
        const sqliteCategory = sqliteDb.prepare('SELECT name FROM Categories WHERE id = ?').get(ing.categoryId);

        if (!sqliteCategory) {
            console.error(`✗ ${ing.name}: No category found in SQLite`);
            errors++;
            continue;
        }

        const categoryName = sqliteCategory.name;
        const tursoCategoryId = categoryIdMap[categoryName];

        if (!tursoCategoryId) {
            console.error(`✗ ${ing.name}: Category "${categoryName}" not found in Turso`);
            errors++;
            continue;
        }

        try {
            await tursoDb.execute({
                sql: `INSERT INTO Ingredients 
              (id, name, categoryId, subcategory, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    ing.id,
                    ing.name,
                    tursoCategoryId, // Use the correct Turso category ID
                    ing.subcategory,
                    ing.minWeight,
                    ing.maxWeight,
                    ing.defaultUnit,
                    ing.postBake,
                    ing.phase,
                    ing.season,
                    ing.allergens,
                    ing.tags,
                    ing.isCustom,
                    ing.dateAdded
                ]
            });

            console.log(`✓ ${ing.name} (${categoryName})`);
            synced++;
        } catch (error) {
            console.error(`✗ ${ing.name}: ${error.message}`);
            errors++;
        }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Successfully synced: ${synced}`);
    console.log(`Errors: ${errors}`);

    // Verify final count
    const finalCount = await tursoDb.execute('SELECT COUNT(*) as count FROM Ingredients');
    console.log(`\nTotal ingredients in Turso: ${finalCount.rows[0].count}`);
}

async function main() {
    try {
        await syncMissingIngredients();
        console.log('\n✅ Sync completed!');
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        sqliteDb.close();
    }
}

main();
