const Database = require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('🔍 Checking for ananas ingredient and undefined references...\n');

// Check if ananas ingredient exists
const ananas = db.prepare("SELECT * FROM Ingredients WHERE name LIKE '%ananas%'").all();
console.log('📌 Ananas ingredients found:', ananas.length);
if (ananas.length > 0) {
    ananas.forEach(ing => {
        console.log(`   - ID: ${ing.id}, Name: ${ing.name}, Category: ${ing.categoryId}`);
    });
}

// Get all preparations and check for undefined or ananas references
console.log('\n📦 Checking preparations...\n');
const preps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();

const problemPreps = [];

preps.forEach(prep => {
    const ingredients = JSON.parse(prep.ingredients || '[]');

    ingredients.forEach((ing, idx) => {
        // Check if ingredient has an ID but the ingredient doesn't exist
        if (ing.ingredientId) {
            const found = db.prepare('SELECT id, name FROM Ingredients WHERE id = ?').get(ing.ingredientId);
            if (!found) {
                problemPreps.push({
                    prepId: prep.id,
                    prepName: prep.name,
                    ingredientId: ing.ingredientId,
                    quantity: ing.quantity,
                    index: idx
                });
            }
        }

        // Check if has embedded name = ananas
        if (ing.name && ing.name.toLowerCase().includes('ananas')) {
            console.log(`✅ Found embedded ananas in "${prep.name}": ${JSON.stringify(ing)}`);
        }
    });
});

if (problemPreps.length > 0) {
    console.log('❌ Preparations with missing ingredient references:\n');
    problemPreps.forEach(p => {
        console.log(`   - "${p.prepName}" (ID: ${p.prepId})`);
        console.log(`     Missing ingredient ID: ${p.ingredientId}`);
        console.log(`     Quantity: ${p.quantity}`);
        console.log(`     Position: ${p.index}\n`);
    });
} else {
    console.log('✅ No preparations with missing ingredient references found.');
}

console.log('\n📊 Summary:');
console.log(`   Total preparations: ${preps.length}`);
console.log(`   Preparations with missing references: ${problemPreps.length}`);

db.close();
