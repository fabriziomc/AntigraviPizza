const Database = require('better-sqlite3').default || require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('\n=== RICERCA TUTTI GLI INGREDIENTI ERRATI ===\n');

// Cerca per pattern parziali
const partialSearches = [
    'frullare',
    'mango',
    'marinatura',
    'soffriggere',
    '100 gr'
];

const allResults = new Map();

partialSearches.forEach(term => {
    const results = db.prepare(`
    SELECT id, name, categoryId
    FROM Ingredients
    WHERE LOWER(name) LIKE LOWER(?)
  `).all(`%${term}%`);

    results.forEach(ing => {
        if (!allResults.has(ing.id)) {
            allResults.set(ing.id, ing);
        }
    });
});

console.log('Ingredienti trovati con pattern parziali:\n');
Array.from(allResults.values()).forEach((ing, index) => {
    console.log(`${index + 1}. "${ing.name}"`);
    console.log(`   ID: ${ing.id}`);
    console.log('');
});

console.log('\n' + '='.repeat(80));
console.log('\n🔍 Cerco ingredienti che sembrano istruzioni...\n');

// Filtra quelli che sono chiaramente istruzioni
const instructions = Array.from(allResults.values()).filter(ing => {
    const name = ing.name.toLowerCase();

    // Pattern che indicano istruzioni
    const isInstruction =
        name.startsWith('frullare') ||
        name.startsWith('soffriggere') ||
        name.startsWith('marinatura:') ||
        name.match(/^\d+\s*(gr|grammi|kg)/i) ||
        name.includes('nell\'olio') ||
        name.includes('con olio');

    return isInstruction;
});

console.log('Ingredienti che sembrano essere istruzioni:\n');
instructions.forEach((ing, index) => {
    console.log(`${index + 1}. "${ing.name}"`);
    console.log(`   ID: ${ing.id}`);
    console.log('');
});

console.log('\n' + '='.repeat(80));
console.log('=== INGREDIENTI DA ELIMINARE ===');
console.log('='.repeat(80) + '\n');

if (instructions.length > 0) {
    console.log(`Totale: ${instructions.length} ingredienti\n`);
    instructions.forEach((ing, index) => {
        console.log(`${index + 1}. ID: ${ing.id}`);
        console.log(`   Nome: "${ing.name}"\n`);
    });

    console.log('\nLista ID per script di eliminazione:');
    console.log(instructions.map(ing => `'${ing.id}'`).join(',\n'));
}

db.close();
