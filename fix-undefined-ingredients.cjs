const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database('./antigravipizza.db');

console.log('🔧 Fixing undefined ingredients in preparations...\n');

// Load original seed data to get ingredient info
const seedPath = path.join(__dirname, 'server', 'seed-data-preparations.json');
const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

// Create a map of preparation ingredients from seed data
const prepIngredients = {};
seedData.preparations.forEach(prep => {
    prepIngredients[prep.id] = prep.ingredients;
});

// Get all preparations from database
const preps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();

let fixedCount = 0;
let unchangedCount = 0;

// Process each preparation
preps.forEach(prep => {
    const currentIngs = JSON.parse(prep.ingredients || '[]');
    const originalIngs = prepIngredients[prep.id];

    if (!originalIngs) {
        console.log(`⚠️ No seed data for: ${prep.name}`);
        return;
    }

    let needsUpdate = false;
    const fixedIngs = [];

    currentIngs.forEach((ing, index) => {
        const originalIng = originalIngs[index];

        if (!originalIng) {
            // Ingredient not in original, keep as is
            fixedIngs.push(ing);
            return;
        }

        // Check if ingredient is broken (has ingredientId but we can't resolve it, or has no name)
        const isBroken = (ing.ingredientId && !ing.name) || (!ing.ingredientId && !ing.name);

        if (isBroken) {
            // Restore from original seed data
            fixedIngs.push({
                name: originalIng.name,
                quantity: ing.quantity || originalIng.quantity,
                unit: ing.unit || originalIng.unit,
                category: originalIng.category,
                perPortion: ing.perPortion || originalIng.perPortion
            });
            needsUpdate = true;
        } else {
            // Keep current (it's ok)
            fixedIngs.push(ing);
        }
    });

    if (needsUpdate) {
        // Update database
        const stmt = db.prepare('UPDATE Preparations SET ingredients = ? WHERE id = ?');
        stmt.run(JSON.stringify(fixedIngs), prep.id);
        fixedCount++;
        console.log(`✅ Fixed: ${prep.name}`);
    } else {
        unchangedCount++;
    }
});

console.log(`\n📊 Results:`);
console.log(`   Fixed: ${fixedCount}`);
console.log(`   Unchanged: ${unchangedCount}`);
console.log(`   Total: ${preps.length}`);

db.close();
