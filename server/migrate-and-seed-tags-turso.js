
import { createClient } from '@libsql/client';
import { INGREDIENT_TAG_MAPPING } from './data/ingredient-tag-mapping.js';
import { PREPARATION_TAG_MAPPING } from './data/preparation-tag-mapping.js';

// Turso credentials
const tursoUrl = 'libsql://antigravipizza-fabriziomc.aws-eu-west-1.turso.io';
const tursoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjYyMTY2MjAsImlkIjoiNGY1MTQ3YWEtM2UxMi00MTQ2LWE2ZTUtMzAyZDk5MjQ4ODBmIiwicmlkIjoiMzYxNGFkZjQtOWEyYS00ZmFmLThlZGYtMjExMmYwODEyM2QyIn0.0zGVAYtzri2Lo3c2qwR6g6wwlBJzSMlcaVHye1bEo2X-YJDXSKLUAgE4Rfwn74HTnpQIb95sxrBigpWL7dt6DQ';

const db = createClient({
    url: tursoUrl,
    authToken: tursoToken
});

async function runMigrationAndSeed() {
    try {
        console.log('🚀 Starting Turso Tag Migration and Seed...\n');

        // 1. Ensure Preparations has tags column
        console.log('📊 Checking Preparations table schema...');
        const prepSchema = await db.execute('PRAGMA table_info(Preparations)');
        const hasPrepTags = prepSchema.rows.some(col => col.name === 'tags');

        if (!hasPrepTags) {
            console.log('➕ Adding tags column to Preparations table...');
            await db.execute('ALTER TABLE Preparations ADD COLUMN tags TEXT');
            console.log('✅ tags column added to Preparations');
        } else {
            console.log('✅ Preparations table already has tags column');
        }

        // 2. Seed Ingredient Tags
        console.log('\n🏷️  Seeding Ingredient Tags...');
        const allIngredients = await db.execute('SELECT name FROM Ingredients');
        const dbIngredientNames = new Set(allIngredients.rows.map(i => i.name));

        let ingUpdated = 0;
        let ingNotFound = 0;

        for (const [name, tags] of Object.entries(INGREDIENT_TAG_MAPPING)) {
            if (dbIngredientNames.has(name)) {
                await db.execute({
                    sql: 'UPDATE Ingredients SET tags = ? WHERE name = ?',
                    args: [JSON.stringify(tags), name]
                });
                ingUpdated++;
            } else {
                ingNotFound++;
            }
        }
        console.log(`✅ Updated ${ingUpdated} ingredients. (${ingNotFound} mapping entries not in DB)`);

        // 3. Seed Preparation Tags
        console.log('\n🏷️  Seeding Preparation Tags...');
        const allPreps = await db.execute('SELECT name FROM Preparations');
        const dbPrepNames = new Set(allPreps.rows.map(p => p.name));

        let prepUpdated = 0;
        let prepNotFound = 0;

        for (const [name, tags] of Object.entries(PREPARATION_TAG_MAPPING)) {
            if (dbPrepNames.has(name)) {
                await db.execute({
                    sql: 'UPDATE Preparations SET tags = ? WHERE name = ?',
                    args: [JSON.stringify(tags), name]
                });
                prepUpdated++;
            } else {
                prepNotFound++;
            }
        }
        console.log(`✅ Updated ${prepUpdated} preparations. (${prepNotFound} mapping entries not in DB)`);

        console.log('\n✨ Migration and seeding completed successfully!');

    } catch (err) {
        console.error('\n❌ Error during migration:', err.message);
        console.error(err.stack);
    } finally {
        db.close();
    }
}

runMigrationAndSeed();
