import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

dotenv.config();

async function cleanEmbeddedData() {
    const db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    console.log('='.repeat(80));
    console.log('DATABASE NORMALIZATION - CLEAN EMBEDDED DATA');
    console.log('='.repeat(80));

    // ============================================================================
    // STEP 1: Verify userId column exists in all tables
    // ============================================================================
    console.log('\n📋 STEP 1: Verifying userId column in all tables');
    console.log('-'.repeat(80));

    const tables = ['Ingredients', 'Preparations', 'Recipes', 'PizzaNights', 'Guests', 'Combinations', 'Categories'];
    const tablesWithUserId = [];
    const tablesWithoutUserId = [];

    for (const table of tables) {
        try {
            const result = await db.execute(`PRAGMA table_info(${table})`);
            const hasUserId = result.rows.some(col => col.name === 'userId');

            if (hasUserId) {
                tablesWithUserId.push(table);
                console.log(`  ✅ ${table}: has userId column`);
            } else {
                tablesWithoutUserId.push(table);
                console.log(`  ❌ ${table}: MISSING userId column`);
            }
        } catch (error) {
            console.log(`  ⚠️  ${table}: Error checking (${error.message})`);
        }
    }

    console.log(`\nSummary:`);
    console.log(`  - Tables with userId: ${tablesWithUserId.length}/${tables.length}`);
    console.log(`  - Tables without userId: ${tablesWithoutUserId.length}/${tables.length}`);

    if (tablesWithoutUserId.length > 0) {
        console.log(`\n⚠️  WARNING: The following tables are missing userId column:`);
        tablesWithoutUserId.forEach(t => console.log(`     - ${t}`));
        console.log(`  These tables won't support multi-user isolation!`);
    }

    // ============================================================================
    // STEP 2: Clean Preparations
    // ============================================================================
    console.log('\n📋 STEP 2: Cleaning Preparations');
    console.log('-'.repeat(80));

    const preparations = await db.execute('SELECT id, name, ingredients FROM Preparations');
    console.log(`Found ${preparations.rows.length} preparations to process`);

    let prepsUpdated = 0;
    let prepsSkipped = 0;
    let totalFieldsRemoved = 0;

    for (const prep of preparations.rows) {
        try {
            const ingredients = JSON.parse(prep.ingredients || '[]');
            let modified = false;
            let fieldsRemovedThisPrep = 0;

            const cleanedIngredients = ingredients.map(ing => {
                const cleaned = { ...ing };

                // Remove embedded data, keep only ID reference and quantity info
                const fieldsToRemove = ['name', 'category', 'categoryName', 'categoryIcon', 'defaultUnit'];
                fieldsToRemove.forEach(field => {
                    if (field in cleaned) {
                        delete cleaned[field];
                        modified = true;
                        fieldsRemovedThisPrep++;
                        totalFieldsRemoved++;
                    }
                });

                return cleaned;
            });

            if (modified) {
                await db.execute({
                    sql: 'UPDATE Preparations SET ingredients = ? WHERE id = ?',
                    args: [JSON.stringify(cleanedIngredients), prep.id]
                });
                prepsUpdated++;
                console.log(`  ✓ Updated "${prep.name}" (removed ${fieldsRemovedThisPrep} embedded fields)`);
            } else {
                prepsSkipped++;
            }
        } catch (error) {
            console.log(`  ✗ Error processing "${prep.name}": ${error.message}`);
        }
    }

    console.log(`\nPreparations Summary:`);
    console.log(`  - Total processed: ${preparations.rows.length}`);
    console.log(`  - Updated: ${prepsUpdated}`);
    console.log(`  - Already clean: ${prepsSkipped}`);
    console.log(`  - Total embedded fields removed: ${totalFieldsRemoved}`);

    // ============================================================================
    // STEP 3: Clean Recipes - Base Ingredients
    // ============================================================================
    console.log('\n📋 STEP 3: Cleaning Recipes - Base Ingredients');
    console.log('-'.repeat(80));

    const recipes = await db.execute('SELECT id, name, baseIngredients, preparations FROM Recipes');
    console.log(`Found ${recipes.rows.length} recipes to process`);

    let recipesUpdated = 0;
    let recipesSkipped = 0;
    let totalIngredientsFieldsRemoved = 0;

    for (const recipe of recipes.rows) {
        try {
            const baseIngredients = JSON.parse(recipe.baseIngredients || '[]');
            let modified = false;
            let fieldsRemovedThisRecipe = 0;

            const cleanedIngredients = baseIngredients.map(ing => {
                const cleaned = { ...ing };

                // Remove embedded ingredient data
                const fieldsToRemove = ['name', 'category', 'categoryName', 'categoryIcon', 'defaultUnit'];
                fieldsToRemove.forEach(field => {
                    if (field in cleaned) {
                        delete cleaned[field];
                        modified = true;
                        fieldsRemovedThisRecipe++;
                        totalIngredientsFieldsRemoved++;
                    }
                });

                return cleaned;
            });

            if (modified) {
                await db.execute({
                    sql: 'UPDATE Recipes SET baseIngredients = ? WHERE id = ?',
                    args: [JSON.stringify(cleanedIngredients), recipe.id]
                });
                recipesUpdated++;
                console.log(`  ✓ Updated "${recipe.name}" base ingredients (removed ${fieldsRemovedThisRecipe} fields)`);
            } else {
                recipesSkipped++;
            }
        } catch (error) {
            console.log(`  ✗ Error processing "${recipe.name}": ${error.message}`);
        }
    }

    console.log(`\nRecipes Base Ingredients Summary:`);
    console.log(`  - Total processed: ${recipes.rows.length}`);
    console.log(`  - Updated: ${recipesUpdated}`);
    console.log(`  - Already clean: ${recipesSkipped}`);
    console.log(`  - Total embedded fields removed: ${totalIngredientsFieldsRemoved}`);

    // ============================================================================
    // STEP 4: Clean Recipes - Preparations
    // ============================================================================
    console.log('\n📋 STEP 4: Cleaning Recipes - Preparations');
    console.log('-'.repeat(80));

    let recipePrepsUpdated = 0;
    let recipePrepsSkipped = 0;
    let totalPrepsFieldsRemoved = 0;

    for (const recipe of recipes.rows) {
        try {
            const preparations = JSON.parse(recipe.preparations || '[]');
            let modified = false;
            let fieldsRemovedThisRecipe = 0;

            const cleanedPreparations = preparations.map(prep => {
                const cleaned = { ...prep };

                // Remove embedded preparation data
                const fieldsToRemove = ['name', 'category', 'description', 'ingredients', 'instructions', 'tips', 'yield', 'prepTime', 'difficulty'];
                fieldsToRemove.forEach(field => {
                    if (field in cleaned) {
                        delete cleaned[field];
                        modified = true;
                        fieldsRemovedThisRecipe++;
                        totalPrepsFieldsRemoved++;
                    }
                });

                return cleaned;
            });

            if (modified) {
                await db.execute({
                    sql: 'UPDATE Recipes SET preparations = ? WHERE id = ?',
                    args: [JSON.stringify(cleanedPreparations), recipe.id]
                });
                recipePrepsUpdated++;
                console.log(`  ✓ Updated "${recipe.name}" preparations (removed ${fieldsRemovedThisRecipe} fields)`);
            } else {
                recipePrepsSkipped++;
            }
        } catch (error) {
            console.log(`  ✗ Error processing "${recipe.name}": ${error.message}`);
        }
    }

    console.log(`\nRecipes Preparations Summary:`);
    console.log(`  - Total processed: ${recipes.rows.length}`);
    console.log(`  - Updated: ${recipePrepsUpdated}`);
    console.log(`  - Already clean: ${recipePrepsSkipped}`);
    console.log(`  - Total embedded fields removed: ${totalPrepsFieldsRemoved}`);

    // ============================================================================
    // FINAL SUMMARY
    // ============================================================================
    console.log('\n' + '='.repeat(80));
    console.log('MIGRATION COMPLETE');
    console.log('='.repeat(80));
    console.log(`\n📊 Total Statistics:`);
    console.log(`  - Preparations cleaned: ${prepsUpdated}`);
    console.log(`  - Recipes base ingredients cleaned: ${recipesUpdated}`);
    console.log(`  - Recipes preparations cleaned: ${recipePrepsUpdated}`);
    console.log(`  - Total embedded fields removed: ${totalFieldsRemoved + totalIngredientsFieldsRemoved + totalPrepsFieldsRemoved}`);
    console.log(`\n✅ Database is now normalized!`);

    if (tablesWithoutUserId.length > 0) {
        console.log(`\n⚠️  Note: ${tablesWithoutUserId.length} table(s) still missing userId column`);
    }
}

cleanEmbeddedData().catch(console.error);
