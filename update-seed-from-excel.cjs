const fs = require('fs');
const Database = require('better-sqlite3');

console.log('🔄 Updating seed-data-preparations.json with Excel data...\n');

// Load Excel preparations
const excelPreps = JSON.parse(fs.readFileSync('./preparations-with-ingredients.json', 'utf8'));

// Load current seed file
const currentSeed = JSON.parse(fs.readFileSync('./server/seed-data-preparations.json', 'utf8'));

// Connect to database to get ingredient mapping
const db = new Database('./antigravipizza.db');
const allIngredients = db.prepare('SELECT id, name FROM Ingredients').all();
const ingredientMap = {};
allIngredients.forEach(ing => {
    ingredientMap[ing.name.toLowerCase()] = ing.name; // Map to actual DB name
});

console.log(`📊 Current seed: ${currentSeed.preparations.length} preparations`);
console.log(`📊 Excel file: ${excelPreps.length} preparations\n`);

// Update or add preparations from Excel
let updated = 0;
let added = 0;

excelPreps.forEach(excelPrep => {
    // Find matching preparation in seed
    const existing = currentSeed.preparations.find(p =>
        p.name.toLowerCase() === excelPrep.name.toLowerCase()
    );

    // Clean and map ingredients
    const mappedIngredients = [];
    excelPrep.ingredients.forEach(ingName => {
        // Clean ingredient name
        let cleanName = ingName.trim();

        // Skip instructions and very long text
        if (cleanName.length > 50 || cleanName.match(/cuocere|mescolare|aggiungere/i)) {
            return;
        }

        // Find in database
        const dbName = ingredientMap[cleanName.toLowerCase()];
        if (dbName) {
            mappedIngredients.push({
                name: dbName,
                quantity: 100, // Default quantity
                unit: 'g',
                perPortion: '25.00',
                category: 'Altro' // Will be resolved by seed script
            });
        }
    });

    if (mappedIngredients.length === 0) {
        return; // Skip if no valid ingredients
    }

    if (existing) {
        // Update existing
        const currentIngs = JSON.parse(existing.ingredients);

        // Only update if Excel has more ingredients
        if (mappedIngredients.length > currentIngs.length) {
            existing.ingredients = JSON.stringify(mappedIngredients);
            updated++;
            console.log(`  ✏️  Updated: ${existing.name} (${currentIngs.length} → ${mappedIngredients.length} ingredients)`);
        }
    } else {
        // Add new
        currentSeed.preparations.push({
            name: excelPrep.name,
            category: 'Preparazioni Base',
            description: '',
            yield: 4,
            prepTime: '',
            difficulty: 'Media',
            ingredients: JSON.stringify(mappedIngredients),
            instructions: '[]',
            tips: '[]',
            isCustom: 0
        });
        added++;
        console.log(`  ➕ Added: ${excelPrep.name} (${mappedIngredients.length} ingredients)`);
    }
});

// Update count
currentSeed.count = currentSeed.preparations.length;

// Save updated seed file
fs.writeFileSync('./server/seed-data-preparations.json', JSON.stringify(currentSeed, null, 2));

console.log(`\n📊 Results:`);
console.log(`   Updated: ${updated}`);
console.log(`   Added: ${added}`);
console.log(`   Total preparations: ${currentSeed.count}`);

console.log(`\n✅ Seed file updated!`);

db.close();
