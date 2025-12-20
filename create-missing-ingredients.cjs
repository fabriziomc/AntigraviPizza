const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const db = new Database('./antigravipizza.db');

console.log('🔍 Finding missing ingredients...\n');

// Get all ingredient IDs referenced in preparations
const preps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();
const referencedIds = new Set();
const missingIngredients = new Map(); // ingredientId -> {name, category}

preps.forEach(prep => {
    const ings = JSON.parse(prep.ingredients || '[]');
    ings.forEach(ing => {
        if (ing.ingredientId) {
            referencedIds.add(ing.ingredientId);
        }
    });
});

console.log(`Found ${referencedIds.size} unique ingredient IDs referenced in preparations`);

// Check which ones exist in Ingredients table
let missingCount = 0;
referencedIds.forEach(id => {
    const exists = db.prepare('SELECT id FROM Ingredients WHERE id = ?').get(id);
    if (!exists) {
        missingCount++;
        // Find info from preparations
        preps.forEach(prep => {
            const ings = JSON.parse(prep.ingredients || '[]');
            const ing = ings.find(i => i.ingredientId === id);
            if (ing && !missingIngredients.has(id)) {
                missingIngredients.set(id, {
                    id: id,
                    name: ing.name || 'Unknown',
                    category: ing.category || 'Altro'
                });
            }
        });
    }
});

console.log(`\n❌ Missing ingredients: ${missingCount}`);
console.log(`\n📋 Missing ingredients details:`);

// Load seed data to find category IDs
const seedIngredientsPath = path.join(__dirname, 'server', 'seed-data-ingredients.json');
const seedData = JSON.parse(fs.readFileSync(seedIngredientsPath, 'utf8'));

// Load categories
const categories = db.prepare('SELECT id, name FROM Categories').all();
const categoryMap = {};
categories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
});

// Create missing ingredients
const stmt = db.prepare(`
    INSERT OR IGNORE INTO Ingredients (id, name, categoryId, minWeight, maxWeight, defaultUnit, postBake, phase, dateAdded, isCustom)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let createdCount = 0;
let notFoundInSeed = [];

missingIngredients.forEach((info, id) => {
    // Try to find in seed data
    const seedIng = seedData.ingredients.find(s =>
        s.name.toLowerCase() === info.name.toLowerCase()
    );

    if (seedIng) {
        // Found in seed, use that data
        const categoryId = categoryMap[seedIng.category] || categoryMap['Altro'];

        stmt.run(
            id, // Keep original ID
            seedIng.name,
            categoryId,
            seedIng.minWeight || null,
            seedIng.maxWeight || null,
            seedIng.defaultUnit || 'g',
            seedIng.postBake ? 1 : 0,
            seedIng.phase || 'topping',
            Date.now(),
            0 // isCustom = false (from seed)
        );

        createdCount++;
        console.log(`  ✅ Created: ${seedIng.name} (${seedIng.category})`);
    } else {
        // Not in seed, create basic entry from prep info
        notFoundInSeed.push(info);
    }
});

// Create ingredients not found in seed
if (notFoundInSeed.length > 0) {
    console.log(`\n⚠️ Creating ${notFoundInSeed.length} ingredients not found in seed data:`);

    notFoundInSeed.forEach(info => {
        const categoryId = categoryMap[info.category] || categoryMap['Altro'];

        stmt.run(
            info.id,
            info.name,
            categoryId,
            null, // minWeight
            null, // maxWeight
            'g', // defaultUnit
            0, // postBake
            'topping', // phase
            Date.now(),
            1 // isCustom = true (created from prep data)
        );

        createdCount++;
        console.log(`  ⚙️ Created: ${info.name} (${info.category}) [custom]`);
    });
}

console.log(`\n📊 Results:`);
console.log(`   Created ingredients: ${createdCount}`);
console.log(`   From seed data: ${createdCount - notFoundInSeed.length}`);
console.log(`   Custom (not in seed): ${notFoundInSeed.length}`);

db.close();
console.log(`\n✅ Done! Run check-undefined-ingredients.cjs again to verify.`);
