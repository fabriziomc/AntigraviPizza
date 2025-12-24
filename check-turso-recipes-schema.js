import { createClient } from '@libsql/client';

// Turso credentials from avvia-turso.bat
const tursoUrl = 'libsql://antigravipizza-fabriziomc.aws-eu-west-1.turso.io';
const tursoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjYyMTY2MjAsImlkIjoiNGY1MTQ3YWEtM2UxMi00MTQ2LWE2ZTUtMzAyZDk5MjQ4ODBmIiwicmlkIjoiMzYxNGFkZjQtOWEyYS00ZmFmLThlZGYtMjExMmYwODEyM2QyIn0.0zGVAYtzri2Lo3c2qwR6g6wwlBJzSMlcaVHye1bEo2X-YJDXSKLUAgE4Rfwn74HTnpQIb95sxrBigpWL7dt6DQ';


console.log('🔍 Connecting to Turso database...\n');
console.log('URL:', tursoUrl.substring(0, 30) + '...');

const db = createClient({
    url: tursoUrl,
    authToken: tursoToken
});

async function checkAndUpdateSchema() {
    try {
        // Get table schema
        console.log('📊 Checking Recipes table schema on Turso...\n');

        const result = await db.execute("PRAGMA table_info(Recipes)");
        const columns = result.rows;

        console.log('Current columns:');
        const columnNames = columns.map(col => col.name);
        columns.forEach(col => {
            console.log(`  - ${col.name} (${col.type})`);
        });

        console.log(`\nTotal columns: ${columns.length}`);

        // Check for missing columns
        const missingColumns = [];

        if (!columnNames.includes('recipeSource')) {
            missingColumns.push('recipeSource');
        }

        if (!columnNames.includes('archetypeUsed')) {
            missingColumns.push('archetypeUsed');
        }

        if (missingColumns.length === 0) {
            console.log('\n✅ All required columns are present!');
            return;
        }

        // Add missing columns
        console.log(`\n⚠️  Missing columns: ${missingColumns.join(', ')}`);
        console.log('🔧 Adding missing columns...\n');

        for (const columnName of missingColumns) {
            console.log(`➕ Adding ${columnName} column...`);
            await db.execute(`ALTER TABLE Recipes ADD COLUMN ${columnName} TEXT`);
            console.log(`✅ ${columnName} column added`);
        }

        // Verify the changes
        console.log('\n📊 Verifying updated schema:');
        const updatedResult = await db.execute("PRAGMA table_info(Recipes)");
        const updatedColumns = updatedResult.rows;

        updatedColumns.forEach(col => {
            console.log(`  - ${col.name} (${col.type})`);
        });

        console.log(`\n✅ Migration completed successfully!`);
        console.log(`Total columns: ${updatedColumns.length}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err.stack);
    } finally {
        db.close();
    }
}

checkAndUpdateSchema();
