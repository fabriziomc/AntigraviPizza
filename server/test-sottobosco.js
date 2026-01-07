/**
 * Test specific recipe parsing
 */

import { parseRecipeFile } from './recipeParser.js';

const testText = `2. Sottobosco White
Base: Mozzarella di bufala e funghi porcini spadellati.
Top (Post-cottura): Carpaccio di tartufo nero, nocciole piemontesi tostate e tritate, timo fresco.
Perché funziona: Giochi sul tono su tono (nero su nero) ma con texture completamente diverse.`;

console.log('🧪 Testing Sottobosco White parsing\n');
console.log('='.repeat(60));

const recipes = parseRecipeFile(testText);
const recipe = recipes[0];

console.log(`\n📝 Recipe: ${recipe.name}\n`);

console.log('🥘 Base Ingredients:');
recipe.baseIngredients.forEach(ing => {
    console.log(`   • ${ing.originalName}`);
    console.log(`     → Normalized: "${ing.name}"`);
});

console.log('\n❄️  Post-Bake Toppings:');
recipe.toppingsPostBake.forEach(ing => {
    console.log(`   • ${ing.originalName}`);
    console.log(`     → Normalized: "${ing.name}"`);
});

console.log('\n' + '='.repeat(60));
