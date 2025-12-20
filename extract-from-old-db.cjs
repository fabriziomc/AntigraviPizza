const Database = require('better-sqlite3');
const fs = require('fs');
const { randomUUID } = require('crypto');

console.log('🔍 Extracting ingredients from old database...\n');

const oldDb = new Database('./antigravipizza-OLD.db');
const currentDb = new Database('./antigravipizza.db');

// Get preparations from old DB
const oldPreps = oldDb.prepare('SELECT id, name, ingredients FROM Preparations').all();
console.log(`📊 Found ${oldPreps.length} preparations in old DB\n`);

// Extract all unique ingredients
const ingredientsMap = new Map(); // name -> {category, examples}

oldPreps.forEach(prep => {
    try {
        const ings = JSON.parse(prep.ingredients || '[]');
        ings.forEach(ing => {
            if (ing.name && ing.name !== 'Unknown' && !ing.name.startsWith('Ingrediente sconosciuto')) {
                const key = ing.name.toLowerCase();
                if (!ingredientsMap.has(key)) {
                    ingredientsMap.set(key, {
                        name: ing.name,
                        category: ing.category || 'Altro',
                        count: 0,
                        preps: []
                    });
                }
                const info = ingredientsMap.get(key);
                info.count++;
                if (info.preps.length < 3) {
                    info.preps.push(prep.name);
                }
            }
        });
    } catch (error) {
        console.error(`Error parsing ${prep.name}:`, error.message);
    }
});

console.log(`✅ Found ${ingredientsMap.size} unique ingredients\n`);

// Get existing ingredients in current DB
const existing = currentDb.prepare('SELECT name FROM Ingredients').all();
const existingNames = new Set(existing.map(i => i.name.toLowerCase()));

// Get categories
const categories = currentDb.prepare('SELECT id, name FROM Categories').all();
const catMap = {};
categories.forEach(c => catMap[c.name] = c.id);

// Create missing ingredients
const stmt = currentDb.prepare(`
    INSERT INTO Ingredients (id, name, categoryId, defaultUnit, postBake, phase, dateAdded, isCustom)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

let created = 0;
let skipped = 0;

console.log('🔨 Creating missing ingredients:\n');

ingredientsMap.forEach((info, key) => {
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
                0 // from old DB, not custom
            );
            created++;
            console.log(`  ✅ ${info.name} (${info.category}) - used in: ${info.preps.slice(0, 2).join(', ')}`);
        } catch (error) {
            console.log(`  ⚠️ Error creating ${info.name}: ${error.message}`);
        }
    } else {
        skipped++;
    }
});

console.log(`\n📊 Results:`);
console.log(`   Created: ${created}`);
console.log(`   Already existed: ${skipped}`);
console.log(`   Total unique: ${ingredientsMap.size}`);

// Update seed file with clean data
console.log(`\n📝 Updating seed-data-preparations.json with clean data...`);

const seedData = {
    version: "2.0",
    count: oldPreps.length,
    preparations: []
};

oldPreps.forEach(prep => {
    seedData.preparations.push({
        id: prep.id,
        name: prep.name,
        category: "Preparazioni Base",
        ingredients: prep.ingredients,
        description: "",
        yield: 4,
        prepTime: "",
        difficulty: "Media",
        instructions: "[]",
        tips: "[]",
        isCustom: 0
    });
});

fs.writeFileSync('./server/seed-data-preparations.json', JSON.stringify(seedData, null, 2), 'utf8');
console.log(`✅ Seed file updated with ${oldPreps.length} clean preparations!`);

oldDb.close();
currentDb.close();

console.log(`\n✅ Done! Now reseed preparations.`);
