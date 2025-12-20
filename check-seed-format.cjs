const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, 'server', 'seed-data-preparations.json');
const data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

console.log('🔍 Checking seed file format...\n');

const firstPrep = data.preparations[0];
console.log('Preparation:', firstPrep.name);
console.log('Ingredients type:', typeof firstPrep.ingredients);

const ings = JSON.parse(firstPrep.ingredients);
console.log('\nFirst 3 ingredients:');
ings.slice(0, 3).forEach((ing, idx) => {
    console.log(`  ${idx}:`, JSON.stringify(ing, null, 4));
});

// Check if has ingredientId
const hasId = ings.some(i => i.ingredientId);
console.log(`\n❌ Has ingredientId: ${hasId}`);

if (hasId) {
    console.log('\n⚠️ PROBLEM: Seed file contains ingredientId references!');
    console.log('This will cause "undefined" errors in preparations.');
} else {
    console.log('\n✅ GOOD: Seed file uses name+category format.');
}
