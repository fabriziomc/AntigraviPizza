const fs = require('fs');
const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

const db = new Database('./antigravipizza.db');

console.log('🔄 Restoring clean seed file and creating missing ingredients...\n');

// Load clean file
const cleanData = JSON.parse(fs.readFileSync('./seed-clean-nobom.json', 'utf8'));

// Extract all unique ingredients with their categories
const ingredientsToCreate = new Map(); // name -> {category, count}

cleanData.preparations.forEach(prep => {
    const ings = JSON.parse(prep.ingredients);
    ings.forEach(ing => {
        if (ing.name && !ing.name.startsWith('Ingrediente sconosciuto')) {
            const key = ing.name.toLowerCase();
            if (!ingredientsToCreate.has(key)) {
                ingredientsToCreate.set(key, {
                    name: ing.name,
                    category: ing.category || 'Altro',
                    count: 0
                });
            }
            ingredientsToCreate.get(key).count++;
        }
    });
});

console.log(`📊 Found ${ingredientsToCreate.size} unique ingredients in clean seed\n`);

// Get existing ingredients
const existing = db.prepare('SELECT name FROM Ingredients').all();
const existingNames = new Set(existing.map(i => i.name.toLowerCase()));

// Get categories
const categories = db.prepare('SELECT id, name FROM Categories').all();
const catMap = {};
categories.forEach(c => catMap[c.name] = c.id);

// Create missing ingredients
const stmt = db.prepare(`
    INSERT INTO Ingredients (id, name, categoryId, defaultUnit, postBake, phase, dateAdded, isCustom)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

let created = 0;
let skipped = 0;

ingredientsToCreate.forEach((info, key) => {
    if (!existingNames.has(key)) {
        const categoryId = catMap[info.category] || catMap['Altro'];

        try {
            stmt.run(
                randomUUID(),
                info.name,
                categoryId,
                'g',
                0,
                'topping',
                Date.now(),
                0 // isCustom = false (from seed)
            );
            created++;
            console.log(`  ✅ Created: ${info.name} (${info.category})`);
        } catch (error) {
            console.log(`  ⚠️ Error: ${info.name} - ${error.message}`);
        }
    } else {
        skipped++;
    }
});

console.log(`\n📊 Results:`);
console.log(`   Created: ${created}`);
console.log(`   Already exists: ${skipped}`);
console.log(`   Total: ${ingredientsToCreate.size}`);

// Copy clean file to replace current
fs.copyFileSync('./seed-clean-nobom.json', './server/seed-data-preparations.json');
console.log(`\n✅ Replaced seed file with clean version!`);

db.close();
