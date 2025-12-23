// Check Turso database status
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

async function checkTurso() {
    console.log('=== Checking Turso Database ===\n');

    // Check Categories
    const categories = await tursoDb.execute('SELECT * FROM Categories ORDER BY displayOrder');
    console.log(`Categories: ${categories.rows.length}`);
    if (categories.rows.length > 0) {
        categories.rows.forEach(cat => {
            console.log(`  ${cat.displayOrder}. ${cat.icon} ${cat.name}`);
        });
    }

    // Check Ingredients
    const ingredients = await tursoDb.execute('SELECT COUNT(*) as count FROM Ingredients');
    console.log(`\nIngredients: ${ingredients.rows[0].count}`);

    // Check ingredients by category
    const byCategory = await tursoDb.execute(`
    SELECT c.name as category, COUNT(i.id) as count
    FROM Categories c
    LEFT JOIN Ingredients i ON c.id = i.categoryId
    GROUP BY c.id, c.name
    ORDER BY c.displayOrder
  `);

    console.log('\nIngredients by category:');
    byCategory.rows.forEach(row => {
        console.log(`  ${row.category}: ${row.count}`);
    });

    console.log('\n✓ Check complete');
}

checkTurso();
