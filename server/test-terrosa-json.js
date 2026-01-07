/**
 * Test La Terrosa parsing - write to file
 */

import { parseRecipeFile } from './recipeParser.js';
import fs from 'fs';

const testText = `3. La Terrosa
Base: Fior di latte e crema di carciofi.
Top (Post-cottura): Chips di carciofi fritti, scaglie di parmigiano reggiano 36 mesi e gocce di riduzione di aceto balsamico.
Perché funziona: L'amaro del carciofo e la croccantezza della chip danno profondità a un impasto che spesso risulta "morbido" al palato.`;

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

fs.writeFileSync('terrosa-parse-result.json', JSON.stringify(output, null, 2));
console.log('✅ Written to terrosa-parse-result.json');
console.log(`Base ingredients: ${output.baseIngredients.length}`);
console.log(`Post-bake toppings: ${output.toppingsPostBake.length}`);
