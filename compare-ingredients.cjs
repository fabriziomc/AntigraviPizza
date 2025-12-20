const fs = require('fs');
const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

console.log('🔍 Comparing Excel ingredients with database...\n');

// Load extracted preparations
const excelPreps = JSON.parse(fs.readFileSync('./preparations-with-ingredients.json', 'utf8'));
console.log(`📊 Excel: ${excelPreps.length} preparations\n`);

// Get current database ingredients
const db = new Database('./antigravipizza.db');
const dbIngredients = db.prepare('SELECT id, name, categoryId FROM Ingredients').all();
const dbIngNames = new Set(dbIngredients.map(i => i.name.toLowerCase()));
console.log(`📊 Database: ${dbIngredients.length} ingredients\n`);

// Extract all unique ingredients from Excel
const excelIngredients = new Map(); // name -> {count, inPreps}

excelPreps.forEach(prep => {
    prep.ingredients.forEach(ingName => {
        // Clean up ingredient name (remove extra text, trim, etc.)
        let cleanName = ingName.trim();

        // Skip very long text (probably instructions, not ingredient names)
        if (cleanName.length > 50) {
            return;
        }

        // Skip common instruction words
        if (cleanName.match(/cuocere|in padella|mescolare|aggiungere|versare|tenere|ripassare/i)) {
            return;
        }

        const key = cleanName.toLowerCase();

        if (!excelIngredients.has(key)) {
            excelIngredients.set(key, {
                name: cleanName,
                count: 0,
                inPreps: []
            });
        }

        const info = excelIngredients.get(key);
        info.count++;
        if (info.inPreps.length < 5) {
            info.inPreps.push(prep.name);
        }
    });
});

console.log(`📊 Excel unique ingredients (cleaned): ${excelIngredients.size}\n`);

// Find missing ingredients
const missing = [];
excelIngredients.forEach((info, key) => {
    if (!dbIngNames.has(key)) {
        missing.push(info);
    }
});

console.log(`❌ Missing in database: ${missing.length}\n`);

if (missing.length > 0) {
    console.log('📝 Missing ingredients (first 20):');
    missing.slice(0, 20).forEach(ing => {
        console.log(`  - ${ing.name} (used ${ing.count}x in: ${ing.inPreps.slice(0, 2).join(', ')})`);
    });
    if (missing.length > 20) {
        console.log(`  ... and ${missing.length - 20} more`);
    }
}

// Save report
fs.writeFileSync('missing-ingredients-report.json', JSON.stringify({
    excelPreparations: excelPreps.length,
    excelIngredients: excelIngredients.size,
    dbIngredients: dbIngredients.length,
    missing: missing.map(m => ({
        name: m.name,
        usageCount: m.count,
        usedIn: m.inPreps
    }))
}, null, 2));

console.log(`\n✅ Saved report to missing-ingredients-report.json`);

db.close();
