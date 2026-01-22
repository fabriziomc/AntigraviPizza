import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

dotenv.config();

async function analyzeSchemaStructure() {
    // Connect directly to Turso
    const db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    console.log('='.repeat(80));
    console.log('DATABASE SCHEMA STRUCTURE ANALYSIS');
    console.log('='.repeat(80));

    // 1. Check Ingredients table structure
    console.log('\n📋 1. INGREDIENTS TABLE STRUCTURE');
    console.log('-'.repeat(80));
    const ingredientsCount = await db.execute('SELECT COUNT(*) as count FROM Ingredients WHERE userId IS NULL');
    console.log(`Total base ingredients: ${ingredientsCount.rows[0].count}`);

    const ingredients = await db.execute('SELECT * FROM Ingredients WHERE userId IS NULL LIMIT 3');
    if (ingredients.rows.length > 0) {
        console.log('\nSample ingredient:');
        console.log(JSON.stringify(ingredients.rows[0], null, 2));
    }

    // 2. Check Preparations table structure
    console.log('\n📋 2. PREPARATIONS TABLE STRUCTURE');
    console.log('-'.repeat(80));
    const preparationsCount = await db.execute('SELECT COUNT(*) as count FROM Preparations WHERE userId IS NULL');
    console.log(`Total base preparations: ${preparationsCount.rows[0].count}`);

    const preparations = await db.execute('SELECT * FROM Preparations WHERE userId IS NULL LIMIT 3');
    if (preparations.rows.length > 0) {
        console.log('\nSample preparation:');
        const prep = preparations.rows[0];
        console.log(`ID: ${prep.id}`);
        console.log(`Name: ${prep.name}`);
        console.log(`Category: ${prep.category}`);
        console.log(`Ingredients (raw JSON):`);
        console.log(prep.ingredients);

        // Parse and analyze ingredients structure
        try {
            const ingredientsArray = JSON.parse(prep.ingredients);
            console.log(`\nParsed ingredients (${ingredientsArray.length} items):`);
            ingredientsArray.slice(0, 3).forEach((ing, idx) => {
                console.log(`  [${idx}]:`, JSON.stringify(ing, null, 2));
            });

            // Check if ingredients have embedded data or just IDs
            const hasEmbeddedData = ingredientsArray.some(ing =>
                ing.name || ing.category || ing.categoryIcon
            );
            const hasIngredientId = ingredientsArray.some(ing => ing.ingredientId);

            console.log(`\n⚠️  Analysis:`);
            console.log(`   - Has embedded ingredient data (name, category, etc.): ${hasEmbeddedData}`);
            console.log(`   - Has ingredientId references: ${hasIngredientId}`);

            if (hasEmbeddedData && hasIngredientId) {
                console.log(`   ❌ ISSUE: Preparations contain BOTH ingredientId AND embedded data (duplication)`);
            } else if (hasEmbeddedData && !hasIngredientId) {
                console.log(`   ❌ ISSUE: Preparations contain embedded data WITHOUT ingredientId (no referencing)`);
            } else if (hasIngredientId && !hasEmbeddedData) {
                console.log(`   ✅ GOOD: Preparations reference ingredients by ID only`);
            }
        } catch (e) {
            console.log('Error parsing ingredients:', e.message);
        }
    }

    // 3. Check Recipes table structure
    console.log('\n📋 3. RECIPES TABLE STRUCTURE');
    console.log('-'.repeat(80));
    const recipesCount = await db.execute('SELECT COUNT(*) as count FROM Recipes WHERE userId IS NULL');
    console.log(`Total base recipes: ${recipesCount.rows[0].count}`);

    const recipes = await db.execute('SELECT * FROM Recipes WHERE userId IS NULL LIMIT 2');
    if (recipes.rows.length > 0) {
        const recipe = recipes.rows[0];
        console.log(`\nSample recipe: ${recipe.name}`);
        console.log(`ID: ${recipe.id}`);

        // Check baseIngredients
        if (recipe.baseIngredients) {
            console.log(`\nBase Ingredients (raw JSON):`);
            const preview = recipe.baseIngredients.substring(0, 200);
            console.log(preview + (recipe.baseIngredients.length > 200 ? '...' : ''));

            try {
                const baseIngs = JSON.parse(recipe.baseIngredients);
                console.log(`\nParsed base ingredients (${baseIngs.length} items):`);
                if (baseIngs.length > 0) {
                    console.log(`  Sample:`, JSON.stringify(baseIngs[0], null, 2));

                    const hasEmbeddedData = baseIngs.some(ing =>
                        ing.name || ing.category || ing.categoryIcon
                    );
                    const hasIngredientId = baseIngs.some(ing => ing.ingredientId);

                    console.log(`\n⚠️  Base Ingredients Analysis:`);
                    console.log(`   - Has embedded ingredient data: ${hasEmbeddedData}`);
                    console.log(`   - Has ingredientId references: ${hasIngredientId}`);

                    if (hasEmbeddedData && hasIngredientId) {
                        console.log(`   ❌ ISSUE: Recipes contain BOTH ingredientId AND embedded data (duplication)`);
                    } else if (hasEmbeddedData && !hasIngredientId) {
                        console.log(`   ❌ ISSUE: Recipes contain embedded data WITHOUT ingredientId (no referencing)`);
                    } else if (hasIngredientId && !hasEmbeddedData) {
                        console.log(`   ✅ GOOD: Recipes reference ingredients by ID only`);
                    }
                }
            } catch (e) {
                console.log('Error parsing base ingredients:', e.message);
            }
        }

        // Check preparations
        if (recipe.preparations) {
            console.log(`\nPreparations (raw JSON):`);
            const preview = recipe.preparations.substring(0, 200);
            console.log(preview + (recipe.preparations.length > 200 ? '...' : ''));

            try {
                const preps = JSON.parse(recipe.preparations);
                console.log(`\nParsed preparations (${preps.length} items):`);
                if (preps.length > 0) {
                    console.log(`  Sample:`, JSON.stringify(preps[0], null, 2));

                    const hasEmbeddedData = preps.some(prep =>
                        prep.name || prep.category || prep.ingredients
                    );
                    const hasPreparationId = preps.some(prep => prep.preparationId || prep.id);

                    console.log(`\n⚠️  Preparations Analysis:`);
                    console.log(`   - Has embedded preparation data: ${hasEmbeddedData}`);
                    console.log(`   - Has preparationId references: ${hasPreparationId}`);

                    if (hasEmbeddedData && hasPreparationId) {
                        console.log(`   ❌ ISSUE: Recipes contain BOTH preparationId AND embedded data (duplication)`);
                    } else if (hasEmbeddedData && !hasPreparationId) {
                        console.log(`   ❌ ISSUE: Recipes contain embedded data WITHOUT preparationId (no referencing)`);
                    } else if (hasPreparationId && !hasEmbeddedData) {
                        console.log(`   ✅ GOOD: Recipes reference preparations by ID only`);
                    }
                }
            } catch (e) {
                console.log('Error parsing preparations:', e.message);
            }
        }
    }

    // 4. Check for duplicates
    console.log('\n📋 4. CHECKING FOR DUPLICATES');
    console.log('-'.repeat(80));

    // Duplicate ingredients by name
    const dupIngredients = await db.execute(`
        SELECT name, COUNT(*) as count 
        FROM Ingredients 
        WHERE userId IS NULL 
        GROUP BY name 
        HAVING COUNT(*) > 1
        ORDER BY count DESC
    `);
    console.log(`\nDuplicate ingredients (same name): ${dupIngredients.rows.length}`);
    if (dupIngredients.rows.length > 0) {
        dupIngredients.rows.forEach(row => {
            console.log(`  - "${row.name}": ${row.count} occurrences`);
        });
    }

    // Duplicate preparations by name
    const dupPreparations = await db.execute(`
        SELECT name, COUNT(*) as count 
        FROM Preparations 
        WHERE userId IS NULL 
        GROUP BY name 
        HAVING COUNT(*) > 1
        ORDER BY count DESC
    `);
    console.log(`\nDuplicate preparations (same name): ${dupPreparations.rows.length}`);
    if (dupPreparations.rows.length > 0) {
        dupPreparations.rows.forEach(row => {
            console.log(`  - "${row.name}": ${row.count} occurrences`);
        });
    }

    console.log('\n' + '='.repeat(80));
    console.log('ANALYSIS COMPLETE');
    console.log('='.repeat(80));
}

analyzeSchemaStructure().catch(console.error);
