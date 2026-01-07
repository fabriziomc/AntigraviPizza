/**
 * Test complete import flow for La Rossa Caramellata
 */

import { parseRecipeFile } from './recipeParser.js';
import { importMultipleRecipes } from './recipeImportService.js';
import DatabaseAdapter from './db-adapter.js';

const testText = `La Rossa Caramellata
Base: Pomodoro San Marzano e cipolle caramellate.
Dopo cottura: Scaglie di parmigiano reggiano 36 mesi e gocce di aceto balsamico.
Perché: Una versione gourmet della marinara, molto spinta sull'acidità e la dolcezza, perfetta sul nero.`;

console.log('🧪 Testing Complete Import Flow for La Rossa Caramellata\n');
console.log('='.repeat(60));

// Parse
const recipes = parseRecipeFile(testText);
const recipe = recipes[0];

console.log(`\n📝 Parsed Recipe: ${recipe.name}`);
console.log(`   Base ingredients: ${recipe.baseIngredients.length}`);
console.log(`   Post-bake toppings: ${recipe.toppingsPostBake.length}`);
console.log(`   Total: ${recipe.baseIngredients.length + recipe.toppingsPostBake.length}`);

console.log('\n🥘 Parsed Base:');
recipe.baseIngredients.forEach((ing, i) => {
    console.log(`   ${i + 1}. "${ing.originalName}" → "${ing.name}"`);
});

console.log('\n❄️  Parsed Post-bake:');
recipe.toppingsPostBake.forEach((ing, i) => {
    console.log(`   ${i + 1}. "${ing.originalName}" → "${ing.name}"`);
});

// Import
console.log('\n\n🔄 Testing Import Service...\n');

const dbAdapter = new DatabaseAdapter();

try {
    const result = await importMultipleRecipes(recipes, dbAdapter);

    console.log('\n✅ Import Results:');
    console.log(`   Success: ${result.success.length}`);
    console.log(`   Failed: ${result.failed.length}`);
    console.log(`   Created ingredients: ${result.totalCreatedIngredients}`);

    if (result.success.length > 0) {
        const imported = result.success[0];
        console.log('\n📦 Imported Recipe:');
        console.log(`   Name: ${imported.recipe.name}`);
        console.log(`   Total ingredients in DB: ${imported.recipe.baseIngredients.length}`);

        console.log('\n🥘 Final Ingredients in Recipe:');
        imported.recipe.baseIngredients.forEach((ing, i) => {
            console.log(`   ${i + 1}. ${ing.name} (${ing.quantity} ${ing.unit}) ${ing.postBake ? '📤' : '📥'}`);
        });
    }

} catch (error) {
    console.error('\n❌ Import failed:', error.message);
}

console.log('\n' + '='.repeat(60));
process.exit(0);
