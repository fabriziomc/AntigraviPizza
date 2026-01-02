const fs = require('fs');

console.log('Reading seed file...');
let content = fs.readFileSync('./server/seed-data-preparations.json', 'utf8');

console.log('Replacing categories...');
const replacements = [
    { from: '"category":"Carne"', to: '"category":"Carni e Salumi"' },
    { from: '"category":"Salsa"', to: '"category":"Basi e Salse"' },
    { from: '"category":"Verdure"', to: '"category":"Verdure e Ortaggi"' }
];

replacements.forEach(r => {
    const regex = new RegExp(r.from, 'g');
    const matches = (content.match(regex) || []).length;
    console.log(`  ${r.from} → ${r.to}: ${matches} replacements`);
    content = content.replace(regex, r.to);
});

console.log('Writing updated file...');
fs.writeFileSync('./server/seed-data-preparations.json', content, 'utf8');

console.log('✅ Categories standardized successfully!');
