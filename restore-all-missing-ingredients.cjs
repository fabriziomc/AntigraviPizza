const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('./antigravipizza.db');

console.log('🔍 Step 1: Identifying missing ingredients from current DB...\n');

// Get all missing ingredient IDs
const preps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();
const missingIds = new Set();

preps.forEach(prep => {
    const ingredients = JSON.parse(prep.ingredients || '[]');
    ingredients.forEach((ing) => {
        if (ing.ingredientId) {
            const found = db.prepare('SELECT id FROM Ingredients WHERE id = ?').get(ing.ingredientId);
            if (!found) {
                missingIds.add(ing.ingredientId);
            }
        }
    });
});

console.log(`Found ${missingIds.size} missing ingredient IDs\n`);

// Step 2: Load backup and find embedded ingredients by ID
console.log('🔍 Step 2: Loading backup to recover ingredient names...\n');

const backup = JSON.parse(fs.readFileSync('./backups/preparations-backup-1765978273581.json', 'utf8'));

const recoveredIngredients = new Map(); // id -> {name, category}

backup.forEach(prep => {
    const ingredients = JSON.parse(prep.ingredients || '[]');
    ingredients.forEach(ing => {
        if (ing.ingredientId && missingIds.has(ing.ingredientId) && ing.name) {
            recoveredIngredients.set(ing.ingredientId, {
                name: ing.name,
                category: ing.category || 'Altro'
            });
        }
    });
});

console.log(`Recovered ${recoveredIngredients.size} ingredients from backup:\n`);
recoveredIngredients.forEach((data, id) => {
    console.log(`   - ${data.name} (${data.category}) [ID: ${id}]`);
});

// Step 3: Get category IDs
const categoryMap = new Map();
const categories = db.prepare('SELECT id, name FROM Categories').all();
categories.forEach(cat => categoryMap.set(cat.name, cat.id));

console.log('\n🍍 Step 3: Restoring ingredients...\n');

const now = Date.now();
let restoredCount = 0;

recoveredIngredients.forEach((data, ingredientId) => {
    const categoryId = categoryMap.get(data.category) || categoryMap.get('Altro');

    // Determine appropriate settings based on ingredient name
    const isAnanas = data.name.toLowerCase().includes('ananas');
    const tags = isAnanas
        ? JSON.stringify(['tropicale', 'dolce', 'frutta', 'postCottura', 'controverso'])
        : JSON.stringify(['base']);

    const postBake = isAnanas ? 1 : 0;
    const season = isAnanas ? JSON.stringify(['estate']) : null;

    try {
        db.prepare(`
            INSERT INTO Ingredients (
                id,
                name,
                categoryId,
                subcategory,
                minWeight,
                maxWeight,
                defaultUnit,
                postBake,
                phase,
                season,
                allergens,
                tags,
                isCustom,
                dateAdded
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            ingredientId,
            data.name,
            categoryId,
            null,
            50,
            150,
            'g',
            postBake,
            'topping',
            season,
            null,
            tags,
            0,
            now
        );

        console.log(`   ✅ Restored: ${data.name} (${data.category})`);
        restoredCount++;
    } catch (error) {
        console.log(`   ❌ Error restoring ${data.name}: ${error.message}`);
    }
});

// Step 4: Verify
console.log(`\n🔍 Step 4: Verifying all preparations...\n`);

let stillMissing = 0;
const currentPreps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();

currentPreps.forEach(prep => {
    const ingredients = JSON.parse(prep.ingredients || '[]');
    ingredients.forEach((ing) => {
        if (ing.ingredientId) {
            const found = db.prepare('SELECT id, name FROM Ingredients WHERE id = ?').get(ing.ingredientId);
            if (!found) {
                console.log(`   ❌ Still missing: ${ing.ingredientId} in "${prep.name}"`);
                stillMissing++;
            }
        }
    });
});

console.log(`\n📊 Summary:`);
console.log(`   Ingredients restored: ${restoredCount}/${recoveredIngredients.size}`);
console.log(`   Preparations with missing references: ${stillMissing}`);

if (stillMissing === 0 && restoredCount > 0) {
    console.log('\n🎉 SUCCESS! All ingredients have been restored!');
    console.log('   You can now check the UI - "undefined" should be replaced with ingredient names.');
} else if (stillMissing > 0) {
    console.log('\n⚠️ WARNING: Some ingredients could not be recovered from backup.');
} else {
    console.log('\n✅ No ingredients needed to be restored.');
}

db.close();
