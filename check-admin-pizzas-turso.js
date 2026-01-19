import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

console.log('🔍 Checking for admin user and their pizzas...\n');

try {
    // Find admin user
    const adminResult = await client.execute({
        sql: `SELECT id, email, name FROM Users WHERE email = ?`,
        args: ['admin@antigravipizza.local']
    });

    if (adminResult.rows.length === 0) {
        console.log('❌ Admin user not found');
        process.exit(1);
    }

    const adminUser = adminResult.rows[0];
    console.log('✅ Admin user found:', {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name
    });

    console.log('\n📋 Fetching last 5 recipes for admin user...\n');

    // Get last 5 recipes for admin user
    const recipesResult = await client.execute({
        sql: `
            SELECT id, name, description, baseIngredients, preparations, createdAt
            FROM Recipes
            WHERE userId = ?
            ORDER BY createdAt DESC
            LIMIT 5
        `,
        args: [adminUser.id]
    });

    console.log(`Found ${recipesResult.rows.length} recipes\n`);

    recipesResult.rows.forEach((recipe, index) => {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`RECIPE ${index + 1}: ${recipe.name}`);
        console.log(`${'='.repeat(80)}`);
        console.log(`ID: ${recipe.id}`);
        console.log(`Created: ${new Date(Number(recipe.createdAt)).toLocaleString()}`);
        console.log(`\nDescription:`);
        console.log(recipe.description);

        console.log(`\nBase Ingredients (raw):`);
        console.log(recipe.baseIngredients);

        try {
            const ingredients = JSON.parse(recipe.baseIngredients);
            console.log(`\nParsed Ingredients (${ingredients.length} total):`);
            ingredients.forEach((ing, i) => {
                console.log(`  ${i + 1}. ${ing.name} (ID: ${ing.id}) - ${ing.quantity}${ing.unit} - PostBake: ${ing.postBake || 0}`);
            });

            // Check for duplicates
            const ingredientNames = ingredients.map(i => i.name.toLowerCase());
            const duplicates = ingredientNames.filter((name, idx) => ingredientNames.indexOf(name) !== idx);
            if (duplicates.length > 0) {
                console.log(`\n⚠️  DUPLICATE INGREDIENTS FOUND: ${[...new Set(duplicates)].join(', ')}`);
            }

            // Check if name ingredients are in the ingredient list
            const nameWords = recipe.name.toLowerCase().split(/\s+/);
            const missingInName = nameWords.filter(word =>
                word.length > 4 &&
                !ingredientNames.some(ing => ing.includes(word))
            );
            if (missingInName.length > 0) {
                console.log(`\n⚠️  Ingredients mentioned in name but not in list: ${missingInName.join(', ')}`);
            }

            // Check for codes in description (e.g., "prep-123", "ing-456")
            const codePattern = /(prep-|ing-)[a-z0-9-]+/gi;
            const codesInDesc = recipe.description.match(codePattern);
            if (codesInDesc) {
                console.log(`\n⚠️  CODES FOUND IN DESCRIPTION: ${codesInDesc.join(', ')}`);
            }

        } catch (e) {
            console.log(`❌ Error parsing ingredients: ${e.message}`);
        }

        console.log(`\nPreparations (raw):`);
        console.log(recipe.preparations);
    });

    console.log('\n\n✅ Analysis complete');
} catch (error) {
    console.error('❌ Error:', error);
} finally {
    client.close();
}
