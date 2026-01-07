/**
 * Test La Terrosa parsing
 */

import { parseRecipeFile } from './recipeParser.js';

const testText = `3. La Terrosa
Base: Fior di latte e crema di carciofi.
Top (Post-cottura): Chips di carciofi fritti, scaglie di parmigiano reggiano 36 mesi e gocce di riduzione di aceto balsamico.
Perché funziona: L'amaro del carciofo e la croccantezza della chip danno profondità a un impasto che spesso risulta "morbido" al palato.`;

console.log('🧪 Testing La Terrosa parsing\n');
console.log('='.repeat(60));

const recipes = parseRecipeFile(testText);
const recipe = recipes[0];

console.log(`\n📝 Recipe: ${recipe.name}\n`);

console.log(`Total base ingredients: ${recipe.baseIngredients.length}`);
console.log('🥘 Base Ingredients:');
recipe.baseIngredients.forEach((ing, i) => {
    console.log(`   ${i + 1}. "${ing.originalName}"`);
    console.log(`      → normalized: "${ing.name}"`);
});

console.log(`\nTotal post-bake toppings: ${recipe.toppingsPostBake.length}`);
console.log('\n❄️  Post-Bake Toppings:');
recipe.toppingsPostBake.forEach((ing, i) => {
    console.log(`   ${i + 1}. "${ing.originalName}"`);
    console.log(`      → normalized: "${ing.name}"`);
});

console.log('\n' + '='.repeat(60));
