const Database = require('better-sqlite3').default || require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('\n=== ANALISI DETTAGLIATA INGREDIENTI TROVATI ===\n');

// Cerca con pattern più precisi
const searches = [
    { term: 'frullare', label: 'Contiene "frullare"' },
    { term: 'marinatura:', label: 'Inizia con "marinatura:"' },
    { term: 'soffriggere', label: 'Contiene "soffriggere"' },
    { term: '100 gr', label: 'Contiene "100 gr"' }
];

const foundIngredients = new Map();

searches.forEach(search => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Cerco: ${search.label}`);
    console.log('='.repeat(80));

    const results = db.prepare(`
    SELECT id, name, categoryId, subcategory, tags
    FROM Ingredients
    WHERE name LIKE ?
  `).all(`%${search.term}%`);

    if (results.length > 0) {
        console.log(`\nTrovati ${results.length} risultati:\n`);
        results.forEach(ing => {
            console.log(`📌 "${ing.name}"`);
            console.log(`   ID: ${ing.id}`);
            console.log(`   Categoria: ${ing.categoryId}`);
            if (ing.tags) console.log(`   Tags: ${ing.tags}`);
            console.log('');

            foundIngredients.set(ing.id, ing);
        });
    } else {
        console.log('\nNessun risultato trovato.\n');
    }
});

console.log('\n' + '='.repeat(80));
console.log('=== RIEPILOGO ===');
console.log('='.repeat(80) + '\n');

console.log(`Totale ingredienti unici trovati: ${foundIngredients.size}\n`);

Array.from(foundIngredients.values()).forEach((ing, index) => {
    console.log(`${index + 1}. "${ing.name}"`);
    console.log(`   ID: ${ing.id}\n`);
});

db.close();
