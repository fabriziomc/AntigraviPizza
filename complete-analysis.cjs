const Database = require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('📊 Complete analysis of current database state\n');
console.log('='.repeat(60));

// Check all ingredients with "ananas" in name
console.log('\n1️⃣ Ananas ingredients in database:\n');
const ananasIngs = db.prepare("SELECT * FROM Ingredients WHERE name LIKE '%nanas%'").all();
console.log(`   Found: ${ananasIngs.length}`);
ananasIngs.forEach(ing => {
    console.log(`   - ${ing.name} (ID: ${ing.id})`);
});

// Check ALL missing references
console.log('\n2️⃣ All missing ingredient references:\n');
const preps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();
const missingMap = new Map();

preps.forEach(prep => {
    const ingredients = JSON.parse(prep.ingredients || '[]');

    ingredients.forEach((ing) => {
        if (ing.ingredientId) {
            const found = db.prepare('SELECT id, name FROM Ingredients WHERE id = ?').get(ing.ingredientId);
            if (!found) {
                if (!missingMap.has(ing.ingredientId)) {
                    missingMap.set(ing.ingredientId, []);
                }
                missingMap.get(ing.ingredientId).push({
                    prepId: prep.id,
                    prepName: prep.name,
                    quantity: ing.quantity
                });
            }
        }
    });
});

console.log(`   Total unique missing IDs: ${missingMap.size}\n`);
missingMap.forEach((usages, id) => {
    console.log(`   🔸 ${id}`);
    usages.forEach(u => {
        console.log(`      └─ in "${u.prepName}" (qty: ${u.quantity})`);
    });
});

// Check preparations that should contain ananas
console.log('\n3️⃣ Preparations with "ananas" in name:\n');
const ananasPreps = db.prepare("SELECT name, ingredients FROM Preparations WHERE name LIKE '%ananas%'").all();
ananasPreps.forEach(prep => {
    console.log(`   📦 ${prep.name}`);
    const ings = JSON.parse(prep.ingredients || '[]');
    ings.forEach(ing => {
        if (ing.ingredientId) {
            const found = db.prepare('SELECT name FROM Ingredients WHERE id = ?').get(ing.ingredientId);
            console.log(`      - ${found ? found.name : '❌ MISSING (ID: ' + ing.ingredientId + ')'} (${ing.quantity}${ing.unit || 'g'})`);
        } else if (ing.name) {
            console.log(`      - ${ing.name} (embedded) (${ing.quantity}${ing.unit || 'g'})`);
        }
    });
});

console.log('\n' + '='.repeat(60));

db.close();
