const fs = require('fs');
const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

console.log('🔨 Creating missing ingredients in database...\n');

// Load missing ingredients report
const report = JSON.parse(fs.readFileSync('./missing-ingredients-report.json', 'utf8'));
const missing = report.missing;

console.log(`Found ${missing.length} missing ingredients to create\n`);

// Connect to database
const db = new Database('./antigravipizza.db');

// Get categories
const categories = db.prepare('SELECT id, name FROM Categories').all();
const catMap = {};
categories.forEach(c => catMap[c.name] = c.id);

// Prepare insert statement
const stmt = db.prepare(`
    INSERT INTO Ingredients (id, name, categoryId, defaultUnit, postBake, phase, dateAdded, isCustom)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

let created = 0;
let skipped = 0;

// Auto-categorize ingredients based on keywords
function guessCategory(ingredientName) {
    const name = ingredientName.toLowerCase();

    // Cheese/Dairy
    if (name.match(/formaggio|ricotta|parmigiano|grana|mozzarella|burrata|gorgonzola|pecorino|mascarpone|latte|panna|burro|yogurt/)) {
        return name.match(/formaggio|parmigiano|grana|mozzarella|burrata|gorgonzola|pecorino/) ? 'Formaggi' : 'Latticini';
    }

    // Meat
    if (name.match(/carne|manzo|maiale|vitello|pollo|tacchino|anatra|prosciutto|salame|pancetta|guanciale|salsiccia|bacon/)) {
        return 'Carni e Salumi';
    }

    // Fish
    if (name.match(/pesce|tonno|salmone|baccalà|stoccafisso|gambero|granchio|cozza|vongola|aragosta|calamaro|polpo|acciuga|sardina/)) {
        return 'Pesce e Frutti di Mare';
    }

    // Vegetables
    if (name.match(/verdura|pomodor|cipolla|aglio|patata|carota|sedano|zucchina|melanzana|peperone|funghi|asparagi|carciofi|cavolo|broccoli|spinaci|lattuga|rucola|radicchio|finocchi|cetriolo/)) {
        return 'Verdure e Ortaggi';
    }

    // Herbs/Spices
    if (name.match(/basilico|prezzemolo|rosmarino|timo|origano|salvia|menta|erba|spezia|pepe|sale|peperoncino|cannella|noce moscata|zenzero|curry|paprika|curcuma|chiodi|alloro/)) {
        return 'Erbe e Spezie';
    }

    // Fruits/Nuts
    if (name.match(/frutta|mela|pera|banana|arancia|limone|fragola|pesca|albicocca|ciliegia|uva|melone|anguria|ananas|kiwi|mandorla|nocciola|noci|pistacchio|pinoli|arachidi/)) {
        return 'Frutta e Frutta Secca';
    }

    // Sauces/Bases
    if (name.match(/salsa|sugo|passata|polpa|concentrato|pesto|maionese|ketchup|senape|aceto|olio|brodo/)) {
        return 'Basi e Salse';
    }

    // Default
    return 'Altro';
}

missing.forEach(ing => {
    // Skip ingredients that look like instructions or are too vague
    if (ing.name.match(/\(|\)|opzionale|q\.b\.|secondo|gusto/i) || ing.name.length > 50) {
        console.log(`  ⚠️ Skipped (looks like instruction): ${ing.name}`);
        skipped++;
        return;
    }

    const category = guessCategory(ing.name);
    const categoryId = catMap[category];

    try {
        stmt.run(
            randomUUID(),
            ing.name,
            categoryId,
            'g',
            0,
            'topping',
            Date.now(),
            0 // not custom (from Excel)
        );
        created++;
        console.log(`  ✅ Created: ${ing.name} → ${category}`);
    } catch (error) {
        console.log(`  ❌ Error: ${ing.name} - ${error.message}`);
        skipped++;
    }
});

console.log(`\n📊 Results:`);
console.log(`   Created: ${created}`);
console.log(`   Skipped: ${skipped}`);
console.log(`   Total: ${missing.length}`);

// Check final count
const finalCount = db.prepare('SELECT COUNT(*) as count FROM Ingredients').get();
console.log(`\n✅ Total ingredients in database now: ${finalCount.count}`);

db.close();
