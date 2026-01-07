const Database = require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('🔍 Detailed analysis of missing ingredients in preparations...\n');

const preps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();
const missingMap = new Map(); // ingredientId -> array of {prepName, quantity}

preps.forEach(prep => {
    const ingredients = JSON.parse(prep.ingredients || '[]');

    ingredients.forEach((ing) => {
        if (ing.ingredientId) {
            const found = db.prepare('SELECT id FROM Ingredients WHERE id = ?').get(ing.ingredientId);
            if (!found) {
                if (!missingMap.has(ing.ingredientId)) {
                    missingMap.set(ing.ingredientId, []);
                }
                missingMap.get(ing.ingredientId).push({
                    prepName: prep.name,
                    quantity: ing.quantity
                });
            }
        }
    });
});

console.log(`📊 Found ${missingMap.size} unique missing ingredient ID(s):\n`);

missingMap.forEach((usages, ingredientId) => {
    console.log(`\n🔸 Missing ID: ${ingredientId}`);
    console.log(`   Used in ${usages.length} preparation(s):`);
    usages.forEach(u => {
        console.log(`   - "${u.prepName}" (quantity: ${u.quantity})`);
    });
});

// Let's check if there's any backup or old DB we can reference
console.log('\n🔍 Checking for existing ingredients with similar names...');
const frutti = db.prepare("SELECT id, name FROM Ingredients WHERE categoryId IN (SELECT id FROM Categories WHERE name = 'Frutta')").all();
console.log(`\nFrutta ingredients in DB: ${frutti.length}`);
frutti.forEach(f => console.log(`   - ${f.name} (${f.id})`));

db.close();
