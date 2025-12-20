const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, 'server', 'seed-data-preparations.json');
const data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

console.log('🧹 Cleaning seed file from ingredientId references...\n');

let modifiedCount = 0;
let totalIngs = 0;

data.preparations.forEach(prep => {
    const ings = JSON.parse(prep.ingredients);
    let modified = false;

    const cleanedIngs = ings.map(ing => {
        totalIngs++;

        // If has ingredientId, remove it and keep only data fields
        if (ing.ingredientId) {
            modified = true;
            modifiedCount++;

            // Return cleaned version without ingredientId
            const cleaned = {
                name: ing.name || 'Unknown',
                quantity: ing.quantity,
                unit: ing.unit,
                perPortion: ing.perPortion
            };

            // Add category if exists
            if (ing.category) {
                cleaned.category = ing.category;
            }

            return cleaned;
        }

        // Already clean
        return ing;
    });

    if (modified) {
        prep.ingredients = JSON.stringify(cleanedIngs);
    }
});

console.log(`📊 Results:`);
console.log(`   Total ingredients: ${totalIngs}`);
console.log(`   Cleaned (had ingredientId): ${modifiedCount}`);
console.log(`   Clean (already good): ${totalIngs - modifiedCount}`);

// Save cleaned file
fs.writeFileSync(seedFile, JSON.stringify(data, null, 2), 'utf8');
console.log(`\n✅ Cleaned seed file saved!`);
console.log(`\n👉 Now run seed-preparations again to repopulate.`);
