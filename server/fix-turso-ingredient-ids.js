// Fix ingredient ID mismatch between SQLite and Turso
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

async function fixIngredientIds() {
    console.log('=== Fixing Ingredient ID Mismatch ===\n');

    try {
        // Step 1: Create mapping from local ingredient IDs to Turso IDs (by name)
        console.log('📋 Creating ID mapping (local → Turso)...');

        const localIngredients = sqliteDb.prepare('SELECT id, name FROM ingredients').all();
        const idMap = new Map(); // localId → tursoId

        for (const localIng of localIngredients) {
            const tursoResult = await tursoDb.execute({
                sql: 'SELECT id FROM Ingredients WHERE name = ?',
                args: [localIng.name]
            });

            if (tursoResult.rows.length > 0) {
                idMap.set(localIng.id, tursoResult.rows[0].id);
            } else {
                console.warn(`⚠️  Ingredient "${localIng.name}" not found in Turso`);
            }
        }

        console.log(`✅ Created mapping for ${idMap.size} ingredients\n`);

        // Step 2: Update all preparations with Turso IDs
        console.log('🔄 Updating preparations with Turso IDs...');

        const preparations = sqliteDb.prepare('SELECT * FROM Preparations').all();
        let updated = 0;
        let errors = 0;

        for (const prep of preparations) {
            try {
                if (!prep.ingredients || prep.ingredients === '[]') {
                    continue;
                }

                const ingredients = JSON.parse(prep.ingredients);
                let hasChanges = false;

                const updatedIngredients = ingredients.map(ing => {
                    if (ing.ingredientId) {
                        // Map local ID to Turso ID
                        const tursoId = idMap.get(ing.ingredientId);
                        if (tursoId && tursoId !== ing.ingredientId) {
                            hasChanges = true;
                            return { ...ing, ingredientId: tursoId };
                        }
                    }
                    return ing;
                });

                if (hasChanges) {
                    const updatedJson = JSON.stringify(updatedIngredients);

                    // Update in Turso
                    await tursoDb.execute({
                        sql: 'UPDATE Preparations SET ingredients = ? WHERE id = ?',
                        args: [updatedJson, prep.id]
                    });

                    console.log(`✓ ${prep.name}`);
                    updated++;
                }
            } catch (error) {
                console.error(`✗ Error with ${prep.name}:`, error.message);
                errors++;
            }
        }

        console.log('\n=== Fix Summary ===');
        console.log(`Updated preparations: ${updated}`);
        console.log(`Errors: ${errors}`);

        // Verify fix for "Emulsione di aglio nero"
        console.log('\n=== Verification: Emulsione di aglio nero ===');
        const emulsionResult = await tursoDb.execute({
            sql: 'SELECT * FROM Preparations WHERE name LIKE ?',
            args: ['%Emulsione%aglio nero%']
        });

        if (emulsionResult.rows.length > 0) {
            const prep = emulsionResult.rows[0];
            const ingredients = JSON.parse(prep.ingredients);

            if (ingredients[0] && ingredients[0].ingredientId) {
                const ingredientId = ingredients[0].ingredientId;
                console.log(`Ingredient ID in Turso: ${ingredientId}`);

                // Verify this ID exists in Turso
                const ingResult = await tursoDb.execute({
                    sql: 'SELECT name FROM Ingredients WHERE id = ?',
                    args: [ingredientId]
                });

                if (ingResult.rows.length > 0) {
                    console.log(`✅ FIXED! ID resolves to: ${ingResult.rows[0].name}`);
                } else {
                    console.log(`❌ STILL BROKEN! ID ${ingredientId} not found in Turso`);
                }
            }
        }

        console.log('\n✅ Fix completed!');

    } catch (error) {
        console.error('❌ Fix failed:', error);
        throw error;
    } finally {
        sqliteDb.close();
    }
}

fixIngredientIds();
