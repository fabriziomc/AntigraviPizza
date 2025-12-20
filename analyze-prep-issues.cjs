const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database('./antigravipizza.db');

console.log('🔍 Analyzing problematic preparations...\n');

// Get seed data
const seedPath = path.join(__dirname, 'server', 'seed-data-preparations.json');
const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

// Find preparations with issues
const dbPreps = db.prepare('SELECT id, name, ingredients FROM Preparations').all();

console.log('Checking first 5 problematic preparations:\n');

let count = 0;
for (const prep of dbPreps) {
    const ings = JSON.parse(prep.ingredients || '[]');
    const hasIssue = ings.some(i =>
        (i.ingredientId && !i.name) || (!i.ingredientId && !i.name)
    );

    if (hasIssue && count < 5) {
        console.log(`\n=== ${prep.name} ===`);
        console.log(`ID: ${prep.id}`);

        // Find in seed
        const seedPrep = seedData.preparations.find(p =>
            p.id === prep.id || p.name === prep.name
        );

        if (seedPrep) {
            console.log('\n📄 SEED DATA:');
            seedPrep.ingredients.forEach((ing, idx) => {
                console.log(`  ${idx}: ${ing.name} (${ing.category}) - ${ing.quantity}${ing.unit}`);
            });
        } else {
            console.log('\n⚠️ NOT FOUND IN SEED');
        }

        console.log('\n💾 DATABASE:');
        ings.forEach((ing, idx) => {
            const parts = [];
            if (ing.ingredientId) parts.push(`ID: ${ing.ingredientId}`);
            if (ing.name) parts.push(`Name: ${ing.name}`);
            if (ing.category) parts.push(`Cat: ${ing.category}`);
            if (ing.quantity) parts.push(`Qty: ${ing.quantity}${ing.unit || ''}`);

            console.log(`  ${idx}: ${parts.join(', ') || 'EMPTY'}`);
        });

        count++;
    }
}

db.close();
