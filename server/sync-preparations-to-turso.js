// Sync preparations from SQLite to Turso
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

async function syncPreparationsToTurso() {
    console.log('=== Syncing Preparations to Turso ===\n');

    try {
        // Get all preparations from SQLite
        const preparations = sqliteDb.prepare('SELECT * FROM Preparations').all();
        console.log(`Found ${preparations.length} preparations in SQLite\n`);

        let synced = 0;
        let skipped = 0;
        let errors = 0;

        for (const prep of preparations) {
            try {
                // Check if preparation already exists in Turso
                const existing = await tursoDb.execute({
                    sql: 'SELECT id FROM Preparations WHERE name = ?',
                    args: [prep.name]
                });

                if (existing.rows.length > 0) {
                    // Update existing preparation
                    await tursoDb.execute({
                        sql: `UPDATE Preparations 
                              SET category = ?, description = ?, yield = ?, prepTime = ?, 
                                  difficulty = ?, ingredients = ?, instructions = ?, tips = ?, 
                                  dateAdded = ?, isCustom = ?
                              WHERE name = ?`,
                        args: [
                            prep.category,
                            prep.description,
                            prep.yield,
                            prep.prepTime,
                            prep.difficulty,
                            prep.ingredients,
                            prep.instructions,
                            prep.tips,
                            prep.dateAdded,
                            prep.isCustom,
                            prep.name
                        ]
                    });
                    console.log(`✓ Updated: ${prep.name}`);
                } else {
                    // Insert new preparation
                    await tursoDb.execute({
                        sql: `INSERT INTO Preparations 
                              (id, name, category, description, yield, prepTime, difficulty, 
                               ingredients, instructions, tips, dateAdded, isCustom)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        args: [
                            prep.id,
                            prep.name,
                            prep.category,
                            prep.description,
                            prep.yield,
                            prep.prepTime,
                            prep.difficulty,
                            prep.ingredients,
                            prep.instructions,
                            prep.tips,
                            prep.dateAdded,
                            prep.isCustom
                        ]
                    });
                    console.log(`✓ Added: ${prep.name}`);
                }
                synced++;
            } catch (error) {
                console.error(`✗ Error with ${prep.name}:`, error.message);
                errors++;
            }
        }

        console.log('\n=== Sync Summary ===');
        console.log(`Total processed: ${preparations.length}`);
        console.log(`Successfully synced: ${synced}`);
        console.log(`Errors: ${errors}`);

        // Verify total count in Turso
        const tursoCount = await tursoDb.execute('SELECT COUNT(*) as count FROM Preparations');
        console.log(`\nTotal preparations in Turso: ${tursoCount.rows[0].count}`);

        // Verify "Emulsione di aglio nero" specifically
        console.log('\n=== Verifying "Emulsione di aglio nero" ===');
        const emulsion = await tursoDb.execute({
            sql: 'SELECT * FROM Preparations WHERE name LIKE ?',
            args: ['%Emulsione%aglio nero%']
        });

        if (emulsion.rows.length > 0) {
            const prep = emulsion.rows[0];
            console.log(`✅ Found: ${prep.name}`);
            console.log(`Ingredients field:`, prep.ingredients);

            const ingredients = JSON.parse(prep.ingredients);
            if (ingredients[0] && ingredients[0].ingredientId) {
                console.log(`✅ Using ingredientId: ${ingredients[0].ingredientId.substring(0, 16)}...`);
                console.log(`✅ No data duplication - references Ingredients table!`);
            } else {
                console.log(`⚠️  Still using old structure with name field`);
            }
        } else {
            console.log('❌ Preparation not found in Turso');
        }

        console.log('\n✅ Sync completed successfully!');

    } catch (error) {
        console.error('❌ Sync failed:', error);
        throw error;
    } finally {
        sqliteDb.close();
    }
}

syncPreparationsToTurso();
