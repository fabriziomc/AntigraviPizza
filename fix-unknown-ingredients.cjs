const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const seedFile = path.join(__dirname, 'server', 'seed-data-preparations.json');
const data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
const db = new Database('./antigravipizza.db');

console.log('🔧 Fixing Unknown ingredients...\n');

// Get all ingredients from DB for lookup
const allIngredients = db.prepare('SELECT id, name, categoryId FROM Ingredients').all();
const categories = db.prepare('SELECT id, name FROM Categories').all();
const catMap = {};
categories.forEach(c => catMap[c.id] = c.name);

let fixedCount = 0;

// For each preparation
data.preparations.forEach(prep => {
    const ings = JSON.parse(prep.ingredients);
    let modified = false;

    const fixedIngs = ings.map(ing => {
        // If name is Unknown or missing
        if (!ing.name || ing.name === 'Unknown') {
            // Try to find by approximate quantity match or just use a generic approach
            // For now, if category exists, we can keep it as embedded
            // User will need to manually fix these or we need more context

            if (!ing.category) {
                ing.category = 'Altro';
                modified = true;
                fixedCount++;
            }

            // Set a placeholder name if completely unknown
            if (!ing.name || ing.name === 'Unknown') {
                ing.name = `Ingrediente sconosciuto ${prep.name}`;
                modified = true;
            }
        }

        return ing;
    });

    if (modified) {
        prep.ingredients = JSON.stringify(fixedIngs);
    }
});

console.log(`✅ Fixed ${fixedCount} unknown ingredients`);

// Save
fs.writeFileSync(seedFile, JSON.stringify(data, null, 2), 'utf8');
console.log(`\n✅ Seed file updated!`);

db.close();
