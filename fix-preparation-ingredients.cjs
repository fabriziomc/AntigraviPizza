// Fix all categories in preparation ingredients
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

console.log('🔧 Fixing Preparation Ingredient Categories...\n');

// Category mapping
const categoryMap = {
    'Carne': 'Carni e Salumi',
    'Salsa': 'Basi e Salse',
    'Base': 'Basi e Salse',
    'Verdure': 'Verdure e Ortaggi',
    'Erbe': 'Erbe e Spezie',
    'Spezie': 'Erbe e Spezie',
    'Aromi': 'Erbe e Spezie',
    'Pesce': 'Pesce e Frutti di Mare',
    'Frutta': 'Frutta e Frutta Secca',
    'Croccante': 'Altro',
    'Finish': 'Altro',
    'Oli': 'Altro',
    'Creme': 'Basi e Salse',
    'Condimenti': 'Basi e Salse',
    'Dolci': 'Altro'
};

// Get all preparations
const preparations = db.prepare('SELECT id, name, ingredients FROM Preparations').all();
console.log(`Found ${preparations.length} preparations to check\n`);

let updatedCount = 0;
const updateStmt = db.prepare('UPDATE Preparations SET ingredients = ? WHERE id = ?');

preparations.forEach(prep => {
    if (!prep.ingredients) return;

    let ingredients;
    try {
        ingredients = JSON.parse(prep.ingredients);
    } catch (e) {
        console.warn(`⚠️  Skipping preparation "${prep.name}": Invalid JSON`);
        return;
    }

    let hasChanges = false;

    // Check and update categories
    ingredients.forEach(ingredient => {
        if (ingredient.category && categoryMap[ingredient.category]) {
            console.log(`  📝 "${prep.name}": ${ingredient.name}`);
            console.log(`     ${ingredient.category} → ${categoryMap[ingredient.category]}`);
            ingredient.category = categoryMap[ingredient.category];
            hasChanges = true;
        }
    });

    // Update if changes were made
    if (hasChanges) {
        updateStmt.run(JSON.stringify(ingredients), prep.id);
        updatedCount++;
    }
});

console.log(`\n✅ Updated ${updatedCount} preparations`);

// Verify - show remaining categories
console.log('\n=== VERIFICATION ===');
const allPreps = db.prepare('SELECT ingredients FROM Preparations WHERE ingredients IS NOT NULL').all();
const categoriesInUse = new Set();

allPreps.forEach(prep => {
    try {
        const ingredients = JSON.parse(prep.ingredients);
        ingredients.forEach(ing => {
            if (ing.category) {
                categoriesInUse.add(ing.category);
            }
        });
    } catch (e) {
        // Skip invalid JSON
    }
});

console.log('Categories in use after migration:');
Array.from(categoriesInUse).sort().forEach(cat => {
    console.log(`  - ${cat}`);
});

db.close();
console.log('\n✅ Done!');
