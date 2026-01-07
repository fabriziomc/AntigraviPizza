const Database = require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('🔍 Checking which ingredient is still missing...\n');

const preps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();

preps.forEach(prep => {
    const ingredients = JSON.parse(prep.ingredients || '[]');

    ingredients.forEach((ing, idx) => {
        if (ing.ingredientId) {
            const found = db.prepare('SELECT id, name FROM Ingredients WHERE id = ?').get(ing.ingredientId);
            if (!found) {
                console.log(`❌ Missing ingredient in "${prep.name}":`);
                console.log(`   ID: ${ing.ingredientId}`);
                console.log(`   Quantity: ${ing.quantity}`);
                console.log(`   Position in array: ${idx}`);
                console.log(`   Full ingredient object:`, JSON.stringify(ing, null, 2));
                console.log('');
            }
        }
    });
});

// Let's also check what we successfully restored
console.log('✅ Successfully restored ingredients:\n');
const restored = db.prepare(`
    SELECT name, categoryId 
    FROM Ingredients 
    WHERE dateAdded > ?
    ORDER BY name
`).all(Date.now() - 60000); // Last minute

restored.forEach(ing => {
    console.log(`   - ${ing.name}`);
});

db.close();
