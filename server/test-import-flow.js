/**
 * Test complete import flow for Sottobosco White
 */

import { parseRecipeFile } from './recipeParser.js';
import { importMultipleRecipes } from './recipeImportService.js';
import DatabaseAdapter from './db-adapter.js';

const testText = `2. Sottobosco White
Base: Mozzarella di bufala e funghi porcini spadellati.
Top (Post-cottura): Carpaccio di tartufo nero, nocciole piemontesi tostate e tritate, timo fresco.
Perché funziona: Giochi sul tono su tono (nero su nero) ma con texture completamente diverse.`;

console.log('🧪 Testing Complete Import Flow\n');
console.log('='.repeat(60));

// Parse
const recipes = parseRecipeFile(testText);
const recipe = recipes[0];

console.log(`\n📝 Parsed Recipe: ${recipe.name}`);
console.log(`   Base ingredients count: ${recipe.baseIngredients.length}`);
console.log(`   Post-bake toppings count: ${recipe.toppingsPostBake.length}`);

console.log('\n🥘 Parsed Base Ingredients:');
recipe.baseIngredients.forEach((ing, idx) => {
    console.log(`   ${idx + 1}. "${ing.originalName}" → normalized: "${ing.name}"`);
});

console.log('\n❄️  Parsed Post-Bake Toppings:');
recipe.toppingsPostBake.forEach((ing, idx) => {
    console.log(`   ${idx + 1}. "${ing.originalName}" → normalized: "${ing.name}"`);
});

// Now test import
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
        console.log('\n📦 Imported Recipe Data:');
        console.log(`   Name: ${imported.recipe.name}`);
        console.log(`   Base ingredients in DB: ${imported.recipe.baseIngredients.length}`);

        console.log('\n🥘 Final Base Ingredients:');
        imported.recipe.baseIngredients.forEach((ing, idx) => {
            console.log(`   ${idx + 1}. ${ing.name} (${ing.quantity} ${ing.unit})`);
        });
    }

    if (result.failed.length > 0) {
        console.log('\n❌ Errors:');
        result.failed.forEach(f => {
            console.log(`   - ${f.recipe}: ${f.error}`);
        });
    }

} catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error.stack);
}

console.log('\n' + '='.repeat(60));
process.exit(0);
