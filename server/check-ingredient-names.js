import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./seed-data-ingredients.json', 'utf8'));

console.log(`Totale ingredienti: ${data.ingredients.length}\n`);

console.log('=== Ingredienti con "aglio" ===');
const aglioIngs = data.ingredients.filter(i => i.name.toLowerCase().includes('aglio'));
aglioIngs.forEach(i => console.log(`  - ${i.name} (${i.category})`));

console.log('\n=== Ingredienti con "burro" ===');
const burroIngs = data.ingredients.filter(i => i.name.toLowerCase().includes('burro'));
burroIngs.forEach(i => console.log(`  - ${i.name} (${i.category})`));

console.log('\n=== Ingredienti con "zucchero" ===');
const zuccheroIngs = data.ingredients.filter(i => i.name.toLowerCase().includes('zucchero'));
zuccheroIngs.forEach(i => console.log(`  - ${i.name} (${i.category})`));
