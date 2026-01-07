/**
 * Delete corrupted imported recipes
 * Removes recipes with double-stringified JSON fields
 */

import DatabaseAdapter from './db-adapter.js';

const dbAdapter = new DatabaseAdapter();

async function deleteCorruptedRecipes() {
    console.log('🔍 Searching for corrupted imported recipes...\n');

    try {
        // Get all recipes
        const allRecipes = await dbAdapter.getAllRecipes();
        console.log(`Total recipes in database: ${allRecipes.length}`);

        // Find corrupted recipes (those with string instead of array/object fields)
        const corrupted = allRecipes.filter(recipe => {
            return (
                typeof recipe.tags === 'string' ||
                typeof recipe.baseIngredients === 'string' ||
                typeof recipe.instructions === 'string' ||
                typeof recipe.preparations === 'string'
            );
        });

        console.log(`\nFound ${corrupted.length} corrupted recipe(s):\n`);

        if (corrupted.length === 0) {
            console.log('✅ No corrupted recipes found!');
            process.exit(0);
        }

        // Show corrupted recipes
        corrupted.forEach((recipe, index) => {
            console.log(`${index + 1}. ${recipe.name} (ID: ${recipe.id})`);
            console.log(`   - tags: ${typeof recipe.tags}`);
            console.log(`   - baseIngredients: ${typeof recipe.baseIngredients}`);
            console.log(`   - instructions: ${typeof recipe.instructions}`);
            console.log(`   - preparations: ${typeof recipe.preparations}`);
        });

        console.log(`\n🗑️  Deleting ${corrupted.length} corrupted recipe(s)...\n`);

        // Delete each corrupted recipe
        for (const recipe of corrupted) {
            await dbAdapter.deleteRecipe(recipe.id);
            console.log(`   ✅ Deleted: ${recipe.name}`);
        }

        console.log(`\n✅ Successfully deleted ${corrupted.length} corrupted recipe(s)!`);
        console.log('\n💡 You can now re-import the recipes using the fixed import system.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }

    process.exit(0);
}

deleteCorruptedRecipes();
