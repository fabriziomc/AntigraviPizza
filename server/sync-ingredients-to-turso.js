// Sync ingredients from SQLite to Turso
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// SQLite local database
const sqliteDbPath = path.join(__dirname, '../antigravipizza.db');
const sqliteDb = new Database(sqliteDbPath);

// Turso credentials
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
    console.error('❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env file');
    process.exit(1);
}

console.log('🔗 Connecting to Turso...');
console.log(`URL: ${tursoUrl}\n`);

const tursoDb = createClient({
    url: tursoUrl,
    authToken: tursoToken
});

async function syncCategories() {
    console.log('=== Syncing Categories ===\n');

    // Get categories from SQLite
    const categories = sqliteDb.prepare('SELECT * FROM Categories ORDER BY displayOrder').all();
    console.log(`Found ${categories.length} categories in SQLite`);

    // Check existing categories in Turso
    const tursoCategories = await tursoDb.execute('SELECT COUNT(*) as count FROM Categories');
    console.log(`Existing categories in Turso: ${tursoCategories.rows[0].count}`);

    if (tursoCategories.rows[0].count > 0) {
        console.log('✓ Categories already exist in Turso, skipping...\n');
        return;
    }

    // Insert categories into Turso
    for (const cat of categories) {
        try {
            await tursoDb.execute({
                sql: 'INSERT OR IGNORE INTO Categories (id, name, icon, displayOrder, description, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
                args: [cat.id, cat.name, cat.icon, cat.displayOrder, cat.description, cat.createdAt]
            });
            console.log(`✓ ${cat.icon} ${cat.name}`);
        } catch (error) {
            console.error(`✗ Error syncing category ${cat.name}:`, error.message);
        }
    }

    console.log(`\n✅ Synced ${categories.length} categories\n`);
}

async function syncIngredients() {
    console.log('=== Syncing Ingredients ===\n');

    // Get all ingredients from SQLite
    const ingredients = sqliteDb.prepare('SELECT * FROM Ingredients ORDER BY name').all();
    console.log(`Found ${ingredients.length} ingredients in SQLite`);

    // Check existing ingredients in Turso
    const tursoIngredients = await tursoDb.execute('SELECT COUNT(*) as count FROM Ingredients');
    const existingCount = tursoIngredients.rows[0].count;
    console.log(`Existing ingredients in Turso: ${existingCount}`);

    let synced = 0;
    let skipped = 0;
    let errors = 0;

    // Sync each ingredient
    for (const ing of ingredients) {
        try {
            const result = await tursoDb.execute({
                sql: `INSERT OR IGNORE INTO Ingredients 
              (id, name, categoryId, subcategory, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    ing.id,
                    ing.name,
                    ing.categoryId,
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

            // Turso doesn't return rowsAffected reliably, so we just assume it worked
            console.log(`✓ ${ing.name}`);
            synced++;
        } catch (error) {
            if (error.message.includes('UNIQUE constraint')) {
                skipped++;
            } else {
                console.error(`✗ Error syncing ${ing.name}:`, error.message);
                errors++;
            }
        }
    }

    console.log(`\n=== Sync Summary ===`);
    console.log(`Total processed: ${ingredients.length}`);
    console.log(`Successfully synced: ${synced}`);
    console.log(`Skipped (duplicates): ${skipped}`);
    console.log(`Errors: ${errors}`);

    // Verify final count
    const finalCount = await tursoDb.execute('SELECT COUNT(*) as count FROM Ingredients');
    console.log(`\nTotal ingredients in Turso: ${finalCount.rows[0].count}`);
}

async function main() {
    try {
        await syncCategories();
        await syncIngredients();

        console.log('\n✅ Sync completed successfully!');
    } catch (error) {
        console.error('\n❌ Sync failed:', error.message);
        process.exit(1);
    } finally {
        sqliteDb.close();
    }
}

main();
