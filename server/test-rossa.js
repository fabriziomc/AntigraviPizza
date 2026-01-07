/**
 * Test La Rossa Caramellata parsing
 */

import { parseRecipeFile } from './recipeParser.js';

const testText = `La Rossa Caramellata
Base: Pomodoro San Marzano e cipolle caramellate.
Dopo cottura: Scaglie di parmigiano reggiano 36 mesi e gocce di aceto balsamico.
Perché: Una versione gourmet della marinara, molto spinta sull'acidità e la dolcezza, perfetta sul nero.`;

console.log('🧪 Testing La Rossa Caramellata parsing\n');
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

// Check what should be there
console.log('\n✅ Expected ingredients:');
console.log('Base:');
console.log('  1. Pomodoro San Marzano');
console.log('  2. cipolle caramellate');
console.log('Post-bake:');
console.log('  1. Scaglie di parmigiano reggiano 36 mesi');
console.log('  2. gocce di aceto balsamico');
