import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

dotenv.config();

async function testNormalizedStructure() {
    const db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    console.log('Testing normalized database structure...\n');

    // Test 1: Fetch a preparation and check its structure
    console.log('Test 1: Checking preparation structure');
    const prep = await db.execute('SELECT * FROM Preparations WHERE userId IS NULL LIMIT 1');
    if (prep.rows.length > 0) {
        const ingredients = JSON.parse(prep.rows[0].ingredients);
        console.log(`  Preparation: "${prep.rows[0].name}"`);
        console.log(`  Ingredients count: ${ingredients.length}`);
        if (ingredients.length > 0) {
            const firstIng = ingredients[0];
            console.log(`  First ingredient structure:`, JSON.stringify(firstIng, null, 2));

            // Check for embedded data
            const hasEmbedded = firstIng.name || firstIng.category || firstIng.categoryIcon;
            if (hasEmbedded) {
                console.log(`  ❌ FAIL: Still contains embedded data!`);
            } else {
                console.log(`  ✅ PASS: No embedded data, only ID reference`);
            }
        }
    }

    // Test 2: Fetch a recipe and check its structure
    console.log('\nTest 2: Checking recipe structure');
    const recipe = await db.execute('SELECT * FROM Recipes WHERE userId IS NULL LIMIT 1');
    if (recipe.rows.length > 0) {
        const baseIngredients = JSON.parse(recipe.rows[0].baseIngredients || '[]');
        const preparations = JSON.parse(recipe.rows[0].preparations || '[]');

        console.log(`  Recipe: "${recipe.rows[0].name}"`);
        console.log(`  Base ingredients count: ${baseIngredients.length}`);
        console.log(`  Preparations count: ${preparations.length}`);

        let allPassed = true;

        if (baseIngredients.length > 0) {
            const firstIng = baseIngredients[0];
            console.log(`  First base ingredient:`, JSON.stringify(firstIng, null, 2));
            const hasEmbedded = firstIng.name || firstIng.category || firstIng.categoryIcon;
            if (hasEmbedded) {
                console.log(`  ❌ FAIL: Base ingredients still contain embedded data!`);
                allPassed = false;
            } else {
                console.log(`  ✅ PASS: Base ingredients clean`);
            }
        }

        if (preparations.length > 0) {
            const firstPrep = preparations[0];
            console.log(`  First preparation:`, JSON.stringify(firstPrep, null, 2));
            const hasEmbedded = firstPrep.name || firstPrep.ingredients || firstPrep.instructions;
            if (hasEmbedded) {
                console.log(`  ❌ FAIL: Preparations still contain embedded data!`);
                allPassed = false;
            } else {
                console.log(`  ✅ PASS: Preparations clean`);
            }
        }

        if (allPassed) {
            console.log(`\n✅ All tests passed! Database is properly normalized.`);
        }
    }

    // Test 3: Verify userId columns
    console.log('\nTest 3: Verifying userId columns');
    const tables = ['Ingredients', 'Preparations', 'Recipes', 'PizzaNights', 'Guests', 'Combinations', 'Categories'];
    let allHaveUserId = true;

    for (const table of tables) {
        const result = await db.execute(`PRAGMA table_info(${table})`);
        const hasUserId = result.rows.some(col => col.name === 'userId');
        if (hasUserId) {
            console.log(`  ✅ ${table}`);
        } else {
            console.log(`  ❌ ${table}`);
            allHaveUserId = false;
        }
    }

    if (allHaveUserId) {
        console.log(`\n✅ All tables have userId column for multi-user support!`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('TESTING COMPLETE');
    console.log('='.repeat(60));
}

testNormalizedStructure().catch(console.error);
