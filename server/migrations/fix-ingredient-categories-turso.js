// Migration script to fix ingredient categories in Turso database
// This should be run on Render where TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are available

import 'dotenv/config';
import { createClient } from '@libsql/client';

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
    console.error('❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
    process.exit(1);
}

console.log('🔗 Connecting to Turso database...');
const db = createClient({
    url: tursoUrl,
    authToken: tursoToken
});

async function fixIngredientCategories() {
    try {
        console.log('\n📊 Fetching category IDs...');

        // Get category IDs
        const carniResult = await db.execute({
            sql: "SELECT id FROM Categories WHERE name = ?",
            args: ['Carni e Salumi']
        });

        const verdureResult = await db.execute({
            sql: "SELECT id FROM Categories WHERE name = ?",
            args: ['Verdure e Ortaggi']
        });

        const carniId = carniResult.rows[0]?.id;
        const verdureId = verdureResult.rows[0]?.id;

        console.log(`  Carni e Salumi: ${carniId}`);
        console.log(`  Verdure e Ortaggi: ${verdureId}`);

        if (!carniId || !verdureId) {
            throw new Error('Categories not found!');
        }

        console.log('\n🔧 Updating ingredient categories...');

        // Fix Foie gras
        const foieResult = await db.execute({
            sql: "UPDATE Ingredients SET categoryId = ? WHERE name = ?",
            args: [carniId, 'Foie gras']
        });
        console.log(`  ✅ Foie gras: ${foieResult.rowsAffected} row(s) updated`);

        // Fix Tartufo bianco
        const tartufo1Result = await db.execute({
            sql: "UPDATE Ingredients SET categoryId = ? WHERE name = ?",
            args: [verdureId, 'Tartufo bianco']
        });
        console.log(`  ✅ Tartufo bianco: ${tartufo1Result.rowsAffected} row(s) updated`);

        // Fix Tartufo nero
        const tartufo2Result = await db.execute({
            sql: "UPDATE Ingredients SET categoryId = ? WHERE name = ?",
            args: [verdureId, 'Tartufo nero']
        });
        console.log(`  ✅ Tartufo nero: ${tartufo2Result.rowsAffected} row(s) updated`);

        // Fix cipolla o cipollotto
        const cipollaResult = await db.execute({
            sql: "UPDATE Ingredients SET categoryId = ? WHERE name = ?",
            args: [verdureId, 'cipolla o cipollotto']
        });
        console.log(`  ✅ cipolla o cipollotto: ${cipollaResult.rowsAffected} row(s) updated`);

        // Verify changes
        console.log('\n✓ Verifying changes...');
        const verifyResult = await db.execute({
            sql: `
                SELECT i.name, c.name as category 
                FROM Ingredients i 
                LEFT JOIN Categories c ON i.categoryId = c.id 
                WHERE i.name IN (?, ?, ?, ?)
                ORDER BY i.name
            `,
            args: ['Foie gras', 'Tartufo bianco', 'Tartufo nero', 'cipolla o cipollotto']
        });

        console.log('\n📋 Current categories:');
        verifyResult.rows.forEach(row => {
            console.log(`  ${row.name} → ${row.category}`);
        });

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        throw error;
    }
}

// Run migration
fixIngredientCategories()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
