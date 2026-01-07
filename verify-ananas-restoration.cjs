const Database = require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('🔍 Verifying Ananas ingredient integration\n');
console.log('='.repeat(60));

// Get Ananas ingredient
const ananas = db.prepare("SELECT * FROM Ingredients WHERE name = 'Ananas'").get();

if (!ananas) {
    console.log('❌ Ananas ingredient NOT found in database!');
    db.close();
    process.exit(1);
}

console.log('\n✅ Ananas ingredient found:');
console.log(`   ID: ${ananas.id}`);
console.log(`   Name: ${ananas.name}`);
console.log(`   Category: ${ananas.categoryId}`);
console.log(`   Tags: ${ananas.tags}`);
console.log(`   Post-bake: ${ananas.postBake ? 'Yes' : 'No'}`);

// Find all preparations using this ingredient
console.log('\n📦 Preparations using Ananas:\n');

const allPreps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();
const prepsWithAnanas = [];

allPreps.forEach(prep => {
    const ingredients = JSON.parse(prep.ingredients || '[]');
    const hasAnanas = ingredients.some(ing => ing.ingredientId === ananas.id);

    if (hasAnanas) {
        prepsWithAnanas.push(prep.name);
        console.log(`   ✅ ${prep.name}`);

        // Show all ingredients for this prep
        ingredients.forEach(ing => {
            if (ing.ingredientId) {
                const foundIng = db.prepare('SELECT name FROM Ingredients WHERE id = ?').get(ing.ingredientId);
                if (foundIng) {
                    console.log(`      - ${foundIng.name} (${ing.quantity}${ing.unit || 'g'})`);
                } else {
                    console.log(`      - ❌ UNDEFINED (${ing.ingredientId})`);
                }
            }
        });
        console.log('');
    }
});

console.log(`\n📊 Summary:`);
console.log(`   Preparations using Ananas: ${prepsWithAnanas.length}`);

// Check if there are still any undefined references
console.log('\n🔍 Checking for remaining undefined references...\n');

let undefinedCount = 0;
allPreps.forEach(prep => {
    const ingredients = JSON.parse(prep.ingredients || '[]');

    ingredients.forEach(ing => {
        if (ing.ingredientId) {
            const found = db.prepare('SELECT name FROM Ingredients WHERE id = ?').get(ing.ingredientId);
            if (!found) {
                console.log(`   ❌ "${prep.name}" has undefined ingredient: ${ing.ingredientId}`);
                undefinedCount++;
            }
        }
    });
});

if (undefinedCount === 0) {
    console.log('   ✅ No undefined references found!');
} else {
    console.log(`\n   ⚠️ Total undefined references: ${undefinedCount}`);
}

console.log('\n' + '='.repeat(60));
console.log('\n🎉 Ananas has been successfully restored!');
console.log('   You can now check the UI to verify the ingredients are displayed correctly.');

db.close();
