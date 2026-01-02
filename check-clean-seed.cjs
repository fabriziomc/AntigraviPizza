const fs = require('fs');
const path = require('path');

const cleanFile = './seed-data-preparations-CLEAN.json';
const data = JSON.parse(fs.readFileSync(cleanFile, 'utf8'));

console.log('🔍 Checking CLEAN seed file from Git...\n');

const firstPrep = data.preparations[0];
console.log('First prep:', firstPrep.name);

const ings = JSON.parse(firstPrep.ingredients);
console.log('\nFirst 3 ingredients:');
ings.slice(0, 3).forEach((ing, idx) => {
    console.log(`  ${idx}:`, JSON.stringify(ing, null, 4));
});

// Check if has ingredientId
const hasId = ings.some(i => i.ingredientId);
console.log(`\nHas ingredientId: ${hasId}`);

// Count total unique ingredients
const allIngredients = new Set();
data.preparations.forEach(prep => {
    const prepIngs = JSON.parse(prep.ingredients);
    prepIngs.forEach(ing => {
        if (ing.name) {
            allIngredients.add(ing.name);
        }
    });
});

console.log(`\nTotal unique ingredient names: ${allIngredients.size}`);
console.log('\nSample ingredient names:');
Array.from(allIngredients).slice(0, 10).forEach(name => {
    console.log(`  - ${name}`);
});
