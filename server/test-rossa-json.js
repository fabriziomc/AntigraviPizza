/**
 * Test La Rossa Caramellata - JSON output
 */

import { parseRecipeFile } from './recipeParser.js';
import fs from 'fs';

const testText = `La Rossa Caramellata
Base: Pomodoro San Marzano e cipolle caramellate.
Dopo cottura: Scaglie di parmigiano reggiano 36 mesi e gocce di aceto balsamico.
Perché: Una versione gourmet della marinara, molto spinta sull'acidità e la dolcezza, perfetta sul nero.`;

const recipes = parseRecipeFile(testText);
const recipe = recipes[0];

const output = {
    name: recipe.name,
    baseIngredients: recipe.baseIngredients.map(i => ({
        original: i.originalName,
        normalized: i.name
    })),
    toppingsPostBake: recipe.toppingsPostBake.map(i => ({
        original: i.originalName,
        normalized: i.name
    }))
};

fs.writeFileSync('rossa-parse-result.json', JSON.stringify(output, null, 2));
console.log('✅ Written to rossa-parse-result.json');
console.log(`Base ingredients: ${output.baseIngredients.length}`);
console.log(`Post-bake toppings: ${output.toppingsPostBake.length}`);

console.log('\nBase:');
output.baseIngredients.forEach((ing, i) => console.log(`  ${i + 1}. ${ing.original}`));

console.log('\nPost-bake:');
output.toppingsPostBake.forEach((ing, i) => console.log(`  ${i + 1}. ${ing.original}`));
