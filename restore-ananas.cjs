const Database = require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('🔍 Extracting missing ingredient IDs from preparations...\n');

const preps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();
const missingIds = new Set();

preps.forEach(prep => {
    const ingredients = JSON.parse(prep.ingredients || '[]');

    ingredients.forEach((ing) => {
        if (ing.ingredientId) {
            const found = db.prepare('SELECT id FROM Ingredients WHERE id = ?').get(ing.ingredientId);
            if (!found) {
                missingIds.add(ing.ingredientId);
                console.log(`❌ Prep: "${prep.name}" → Missing ID: ${ing.ingredientId}, Qty: ${ing.quantity}`);
            }
        }
    });
});

console.log(`\n📊 Found ${missingIds.size} unique missing ingredient ID(s):`);
missingIds.forEach(id => console.log(`   - ${id}`));

// Most likely this is the deleted "ananas" ingredient
// Let's restore it
if (missingIds.size === 1) {
    const ananasId = Array.from(missingIds)[0];

    console.log(`\n🍍 Restoring "Ananas" ingredient with ID: ${ananasId}...\n`);

    // Get Frutta category ID
    const fruttaCategory = db.prepare("SELECT id FROM Categories WHERE name = 'Frutta'").get();

    if (!fruttaCategory) {
        console.error('❌ Error: Frutta category not found!');
        db.close();
        process.exit(1);
    }

    console.log(`   Using category: Frutta (ID: ${fruttaCategory.id})`);

    // Insert the ananas ingredient
    const now = Date.now();
    const tags = JSON.stringify([
        'tropicale',
        'dolce',
        'frutta',
        'postCottura',
        'controverso'
    ]);

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
        ananasId,
        'Ananas',
        fruttaCategory.id,
        null,
        50,
        150,
        'g',
        1, // postBake
        'topping',
        JSON.stringify(['estate']), // season
        null, // allergens
        tags,
        0, // not custom
        now
    );

    console.log('✅ Ananas ingredient restored successfully!\n');

    // Verify all preparations now have valid references
    console.log('🔍 Verifying preparations...\n');

    let stillMissing = 0;
    preps.forEach(prep => {
        const ingredients = JSON.parse(prep.ingredients || '[]');

        ingredients.forEach((ing) => {
            if (ing.ingredientId) {
                const found = db.prepare('SELECT id, name FROM Ingredients WHERE id = ?').get(ing.ingredientId);
                if (!found) {
                    console.log(`❌ Still missing: ${ing.ingredientId} in "${prep.name}"`);
                    stillMissing++;
                }
            }
        });
    });

    if (stillMissing === 0) {
        console.log('✅ All preparations now have valid ingredient references!\n');
        console.log('🎉 Restoration complete! You can now check the UI.');
    } else {
        console.log(`⚠️ Warning: ${stillMissing} ingredient reference(s) still missing.`);
    }

} else if (missingIds.size === 0) {
    console.log('\n✅ No missing ingredient IDs found. Nothing to restore.');
} else {
    console.log(`\n⚠️ Found ${missingIds.size} missing IDs. Expected only 1 (ananas).`);
    console.log('   Please verify manually which one is the ananas ingredient.');
}

db.close();
