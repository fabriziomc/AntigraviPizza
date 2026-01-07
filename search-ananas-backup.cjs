const fs = require('fs');

console.log('🔍 Searching for ananas in preparations backup...\n');

const backup = JSON.parse(fs.readFileSync('./backups/preparations-backup-1765978273581.json', 'utf8'));

let found = false;

backup.forEach(prep => {
    const ingredients = JSON.parse(prep.ingredients || '[]');

    ingredients.forEach(ing => {
        if (ing.name && ing.name.toLowerCase().includes('ananas')) {
            console.log(`\n🍍 Found in preparation: "${prep.name}"`);
            console.log(`   Ingredient details:`, JSON.stringify(ing, null, 2));
            found = true;
        }
    });
});

if (!found) {
    console.log('❌ No ananas found in preparations backup.');
    console.log('\n🔍 Let me search for ALL ingredients in backup that might be missing...\n');

    // Get all unique embedded ingredients
    const embeddedIngredients = new Map();

    backup.forEach(prep => {
        const ingredients = JSON.parse(prep.ingredients || '[]');

        ingredients.forEach(ing => {
            if (ing.name) {
                const key = `${ing.name}|${ing.category || 'unknown'}`;
                if (!embeddedIngredients.has(key)) {
                    embeddedIngredients.set(key, {
                        name: ing.name,
                        category: ing.category,
                        preps: []
                    });
                }
                embeddedIngredients.get(key).preps.push(prep.name);
            }
        });
    });

    console.log(`Found ${embeddedIngredients.size} unique embedded ingredients:`);
    embeddedIngredients.forEach((data, key) => {
        console.log(`\n   ${data.name} (${data.category})`);
        console.log(`     Used in: ${data.preps.join(', ')}`);
    });
}
