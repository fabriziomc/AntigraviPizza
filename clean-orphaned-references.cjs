const Database = require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('🔧 Cleaning orphaned ingredient reference...\n');

const orphanId = '0440272f-4e6e-4e83-95b4-95056184e746';

const preps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();
let fixedCount = 0;

preps.forEach(prep => {
    const ingredients = JSON.parse(prep.ingredients || '[]');
    const originalLength = ingredients.length;

    // Remove the orphaned reference
    const filtered = ingredients.filter(ing => ing.ingredientId !== orphanId);

    if (filtered.length < originalLength) {
        // Update the preparation
        db.prepare('UPDATE Preparations SET ingredients = ? WHERE id = ?')
            .run(JSON.stringify(filtered), prep.id);

        console.log(`✅ Removed orphaned reference from "${prep.name}"`);
        console.log(`   Ingredients: ${originalLength} → ${filtered.length}`);
        fixedCount++;
    }
});

console.log(`\n📊 Summary:`);
console.log(`   Preparations fixed: ${fixedCount}`);

// Verify all is good now
console.log('\n🔍 Final verification...\n');

const verifyPreps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();
let stillMissing = 0;

verifyPreps.forEach(prep => {
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

if (stillMissing === 0) {
    console.log('✅ All preparations now have valid ingredient references!');
    console.log('\n🎉 SUCCESS! The database is clean.');
    console.log('   You can now check the UI - all ingredients should be properly displayed.');
} else {
    console.log(`⚠️ Warning: ${stillMissing} reference(s) still problematic.`);
}

db.close();
