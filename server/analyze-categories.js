// Script to analyze ingredient categories and find errors
const fs = require('fs');

const seedFile = './server/seed-data-ingredients.json';
const data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

// Group by category
const byCategory = {};
data.forEach(ing => {
    const cat = ing.category || 'UNCATEGORIZED';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(ing.name);
});

console.log('\n=== INGREDIENTS BY CATEGORY ===\n');
Object.keys(byCategory).sort().forEach(cat => {
    console.log(`\n${cat} (${byCategory[cat].length} items):`);
    console.log(byCategory[cat].sort().join(', '));
});

// Find suspicious items
console.log('\n\n=== SUSPICIOUS CATEGORIZATIONS ===\n');

const fishCategory = data.filter(i => i.category === 'Pesce e Frutti di Mare');
const suspicious = fishCategory.filter(i => {
    const name = i.name.toLowerCase();
    return name.includes('tartufo') ||
        name.includes('foie') ||
        name.includes('funghi') ||
        name.includes('cipoll');
});

console.log('Non-fish items in "Pesce e Frutti di Mare":');
suspicious.forEach(i => console.log(`  - ${i.name} (id: ${i.id})`));

const meatCategory = data.filter(i => i.category === 'Carni e Salumi');
const suspiciousMeat = meatCategory.filter(i => {
    const name = i.name.toLowerCase();
    return name.includes('cipoll') ||
        name.includes('aglio') ||
        name.includes('fungh') ||
        name.includes('verdur');
});

console.log('\nNon-meat items in "Carni e Salumi":');
suspiciousMeat.forEach(i => console.log(`  - ${i.name} (id: ${i.id})`));
