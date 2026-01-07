/**
 * Test DolceAmara parsing
 */

import { parseRecipeFile } from './recipeParser.js';

const testText = `DolceAmara
Base: Fior di latte e Gorgonzola
Dopo cottura: Fettine di pera, Gherigli di noci, miele di castagno.
Perché: Il bianco della pera e del formaggio sul nero è spettacolare.`;

console.log('🧪 Testing DolceAmara parsing\n');
console.log('='.repeat(60));

const recipes = parseRecipeFile(testText);
const recipe = recipes[0];

console.log(`\n📝 Recipe: ${recipe.name}\n`);

console.log(`Total base ingredients: ${recipe.baseIngredients.length}`);
console.log('🥘 Base Ingredients:');
recipe.baseIngredients.forEach((ing, i) => {
    console.log(`   ${i + 1}. "${ing.originalName}"`);
});

console.log(`\nTotal post-bake toppings: ${recipe.toppingsPostBake.length}`);
console.log('\n❄️  Post-Bake Toppings:');
recipe.toppingsPostBake.forEach((ing, i) => {
    console.log(`   ${i + 1}. "${ing.originalName}"`);
});

console.log('\n' + '='.repeat(60));
