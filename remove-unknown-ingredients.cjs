const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, 'server', 'seed-data-preparations.json');
const data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

console.log('🧹 Removing Unknown ingredients from seed file...\n');

let removedCount = 0;
let totalBefore = 0;
let totalAfter = 0;

data.preparations.forEach(prep => {
    const ings = JSON.parse(prep.ingredients);
    totalBefore += ings.length;

    // Filter out Unknown ingredients
    const cleanedIngs = ings.filter(ing => {
        const isUnknown = !ing.name || ing.name === 'Unknown' || ing.name.startsWith('Ingrediente sconosciuto');
        if (isUnknown) {
            removedCount++;
            console.log(`  ❌ Removed: ${ing.name || 'Unnamed'} from ${prep.name}`);
            return false;
        }
        return true;
    });

    totalAfter += cleanedIngs.length;
    prep.ingredients = JSON.stringify(cleanedIngs);
});

console.log(`\n📊 Results:`);
console.log(`   Total ingredients before: ${totalBefore}`);
console.log(`   Removed Unknown: ${removedCount}`);
console.log(`   Total ingredients after: ${totalAfter}`);

// Save
fs.writeFileSync(seedFile, JSON.stringify(data, null, 2), 'utf8');
console.log(`\n✅ Seed file cleaned!`);
console.log(`\n👉 Note: Some preparations may now have fewer ingredients than expected.`);
console.log(`You'll need to manually add missing ingredients to those preparations.`);
