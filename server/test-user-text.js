/**
 * Test parsing with the exact text you provided
 */

import { parseRecipeFile } from './recipeParser.js';

// Using the exact text from user
const testText = `DolceAmara
Base: Fior di latte e Gorgonzola
Dopo cottura: Fettine di pera, Gherigli di noci, miele di castagno.
Perché: Il bianco della pera e del formaggio sul nero è spettacolare.`;

console.log('🧪 Testing with user-provided text\n');
console.log('Original text:');
console.log(testText);
console.log('\n' + '='.repeat(60));

const recipes = parseRecipeFile(testText);
const recipe = recipes[0];

console.log(`\n📝 Recipe: ${recipe.name}`);
console.log(`\nBase ingredients (${recipe.baseIngredients.length}):`);
recipe.baseIngredients.forEach((ing, i) => {
    console.log(`   ${i + 1}. "${ing.originalName}"`);
});

console.log(`\nPost-bake toppings (${recipe.toppingsPostBake.length}):`);
recipe.toppingsPostBake.forEach((ing, i) => {
    console.log(`   ${i + 1}. "${ing.originalName}"`);
});

console.log('\n' + '='.repeat(60));
console.log('\n⚠️  NOTE: The text you provided does NOT mention:');
console.log('   - cipolle caramellate');
console.log('   - aceto balsamico');
console.log('\nPlease provide the COMPLETE recipe text if these ingredients');
console.log('should be included!');
