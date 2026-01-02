// Fix script to update recipeGenerator.js to use ingredient IDs instead of embedded categories
// This should be run AFTER fixing the generator to stop using hardcoded categories

const fs = require('fs');
const path = require('path');

const generatorPath = path.join(__dirname, 'src', 'modules', 'recipeGenerator.js');

console.log('📝 Reading recipeGenerator.js...\n');

let content = fs.readFileSync(generatorPath, 'utf8');

const replacements = [
    // Fix categorizeIngredient function
    { from: "return 'Carne';", to: "return 'Carni e Salumi';" },
    { from: "return 'Verdure';", to: "return 'Verdure e Ortaggi';" },
    { from: "return 'Erbe e Spezie';", to: "return 'Frutta e Frutta Secca';" }, // finishes should map to this

    // Fix hardcoded categories in archetype generation
    { from: "category: 'Frutta'", to: "category: 'Frutta e Frutta Secca'" },
    { from: "category: 'Croccante'", to: "category: 'Frutta e Frutta Secca'" },
    { from: "category: 'Base'", to: "category: 'Basi e Salse'" },
    { from: "category: 'Carne'", to: "category: 'Carni e Salumi'" },
    { from: "category: 'Verdure'", to: "category: 'Verdure e Ortaggi'" },
    { from: "category: 'Pesce'", to: "category: 'Pesce e Frutti di Mare'" },
    { from: "category: 'Aromi'", to: "category: 'Erbe e Spezie'" },
    { from: "category: 'Erbe'", to: "category: 'Erbe e Spezie'" },
    { from: "category: 'Finish'", to: "category: 'Altro'" },
    { from: "category: 'Semi'", to: "category: 'Frutta e Frutta Secca'" },
    { from: "category: 'Salsa'", to: "category: 'Basi e Salse'" },
    { from: "category: 'Oli'", to: "category: 'Altro'" },
];

console.log('🔧 Applying fixes...\n');

let totalReplacements = 0;
replacements.forEach(r => {
    const regex = new RegExp(r.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = (content.match(regex) || []).length;
    if (matches > 0) {
        console.log(`  ✓ ${r.from} → ${r.to}: ${matches} replacements`);
        content = content.replace(regex, r.to);
        totalReplacements += matches;
    }
});

if (totalReplacements > 0) {
    console.log(`\n📝 Writing updated file...\n`);
    fs.writeFileSync(generatorPath, content, 'utf8');
    console.log(`✅ Fixed ${totalReplacements} category references in recipeGenerator.js`);
} else {
    console.log('\n⚠️  No replacements made - file may already be fixed');
}
