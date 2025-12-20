const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

const db = new Database('./antigravipizza.db');
const seedFile = path.join(__dirname, 'server', 'seed-data-preparations.json');
const seedData = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

console.log('🔍 Finding ingredients used in preparations but not in Ingredients table...\n');

// Get all existing ingredients
const existingIngs = db.prepare('SELECT name, categoryId FROM Ingredients').all();
const existingNames = new Set(existingIngs.map(i => i.name.toLowerCase()));

console.log(`📊 Existing ingredients in DB: ${existingNames.size}`);

// Get all ingredients from preparations
const prepIngredients = new Map(); // name -> {category, count}

seedData.preparations.forEach(prep => {
    const ings = JSON.parse(prep.ingredients);
    ings.forEach(ing => {
        if (ing.name && ing.name !== 'Unknown' && !ing.name.startsWith('Ingrediente sconosciuto')) {
            const key = ing.name.toLowerCase();
            if (!prepIngredients.has(key)) {
                prepIngredients.set(key, {
                    name: ing.name,
                    category: ing.category || 'Altro',
                    count: 0
                });
            }
            prepIngredients.get(key).count++;
        }
    });
});

console.log(`📊 Unique ingredients in preparations: ${prepIngredients.size}\n`);

// Find missing ones
const missing = [];
prepIngredients.forEach((info, key) => {
    if (!existingNames.has(key)) {
        missing.push(info);
    }
});

console.log(`❌ Missing ingredients: ${missing.length}\n`);

if (missing.length > 0) {
    console.log('📝 Missing ingredients list:');
    missing.slice(0, 20).forEach(ing => {
        console.log(`   - ${ing.name} (${ing.category}) - used ${ing.count} times`);
    });
    if (missing.length > 20) {
        console.log(`   ... and ${missing.length - 20} more`);
    }

    // Get categories
    const categories = db.prepare('SELECT id, name FROM Categories').all();
    const catMap = {};
    categories.forEach(c => catMap[c.name] = c.id);

    console.log('\n🔨 Creating missing ingredients...\n');

    const stmt = db.prepare(`
        INSERT INTO Ingredients (id, name, categoryId, defaultUnit, postBake, phase, dateAdded, isCustom)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let created = 0;
    missing.forEach(ing => {
        const categoryId = catMap[ing.category] || catMap['Altro'];

        try {
            stmt.run(
                randomUUID(),
                ing.name,
                categoryId,
                'g',
                0,
                'topping',
                Date.now(),
                1 // isCustom = true (from prep)
            );
            created++;
            console.log(`   ✅ Created: ${ing.name} (${ing.category})`);
        } catch (error) {
            console.log(`   ⚠️ Skipped: ${ing.name} - ${error.message}`);
        }
    });

    console.log(`\n✅ Created ${created} new ingredients!`);
} else {
    console.log('✅ No missing ingredients - all good!');
}

db.close();
