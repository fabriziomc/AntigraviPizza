const Database = require('better-sqlite3').default || require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('\n=== RICERCA INGREDIENTI SPECIFICI ===\n');

// Cerca gli ingredienti menzionati dall'utente
const searchTerms = [
    'frullare mango',
    'marinatura',
    'salsa di soia',
    'soffriggere',
    '100 gr di farina'
];

console.log('Cerco ingredienti contenenti:\n');
searchTerms.forEach(term => console.log(`  - "${term}"`));
console.log('\n' + '='.repeat(80) + '\n');

const allFound = [];

searchTerms.forEach(term => {
    const results = db.prepare(`
    SELECT id, name, categoryId, subcategory, tags
    FROM Ingredients
    WHERE name LIKE ?
  `).all(`%${term}%`);

    if (results.length > 0) {
        console.log(`\n📌 Trovati ${results.length} risultati per "${term}":\n`);
        results.forEach(ing => {
            console.log(`   ID: ${ing.id}`);
            console.log(`   Nome: ${ing.name}`);
            console.log(`   Categoria: ${ing.categoryId}`);
            if (ing.subcategory) console.log(`   Subcategoria: ${ing.subcategory}`);
            if (ing.tags) console.log(`   Tags: ${ing.tags}`);
            console.log('');

            allFound.push(ing);
        });
    }
});

// Rimuovi duplicati
const uniqueIds = [...new Set(allFound.map(i => i.id))];
const uniqueIngredients = uniqueIds.map(id =>
    allFound.find(i => i.id === id)
);

console.log('\n' + '='.repeat(80));
console.log('=== RIEPILOGO COMPLETO ===');
console.log('='.repeat(80) + '\n');

console.log(`Totale ingredienti errati trovati: ${uniqueIngredients.length}\n`);

uniqueIngredients.forEach((ing, index) => {
    console.log(`${index + 1}. "${ing.name}" (ID: ${ing.id})`);
});

console.log('\n\n=== ID DA ELIMINARE ===');
console.log(uniqueIds.map(id => `'${id}'`).join(',\n'));

db.close();
