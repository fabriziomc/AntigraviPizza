const Database = require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('🔍 Checking preparation ingredients...\n');

// Get all preparations
const preps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();

let issueCount = 0;
const missingIds = new Set();
const embeddedIngredients = [];

preps.forEach(prep => {
    const ings = JSON.parse(prep.ingredients || '[]');

    ings.forEach(ing => {
        // Check if has ingredientId
        if (ing.ingredientId) {
            // Verify it exists
            const found = db.prepare('SELECT id, name FROM Ingredients WHERE id = ?').get(ing.ingredientId);
            if (!found) {
                console.log(`❌ Prep: "${prep.name}" → Missing ingredient ID: ${ing.ingredientId}`);
                missingIds.add(ing.ingredientId);
                issueCount++;
            }
        } else if (ing.name) {
            // Embedded ingredient (not migrated)
            embeddedIngredients.push({
                prep: prep.name,
                ingredient: ing.name,
                category: ing.category
            });
        } else {
            // No ID and no name = undefined!
            console.log(`⚠️ Prep: "${prep.name}" → Ingredient without ID and name:`, JSON.stringify(ing));
            issueCount++;
        }
    });
});

console.log(`\n📊 Summary:`);
console.log(`   Total issues: ${issueCount}`);
console.log(`   Missing unique ingredient IDs: ${missingIds.size}`);
console.log(`   Embedded ingredients (not migrated): ${embeddedIngredients.length}`);

if (embeddedIngredients.length > 0) {
    console.log(`\n📝 Embedded ingredients:`);
    embeddedIngredients.slice(0, 10).forEach(e => {
        console.log(`   - ${e.ingredient} (${e.category}) in "${e.prep}"`);
    });
    if (embeddedIngredients.length > 10) {
        console.log(`   ... and ${embeddedIngredients.length - 10} more`);
    }
}

db.close();
