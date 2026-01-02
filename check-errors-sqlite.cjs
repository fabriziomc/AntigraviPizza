const Database = require('better-sqlite3').default || require('better-sqlite3');

console.log('\n=== VERIFICA INGREDIENTI ERRATI IN SQLITE ===\n');

const db = new Database('./antigravipizza.db');

// ID degli ingredienti errati
const errorIds = [
    'e0eeeaa7-4da6-4f4c-aa2e-8885c41c258a', // soffriggere nell'olio il sedano
    '804b0852-1ef0-4a34-84cf-99abca9cf955'  // 100 gr di farina di castagne
];

console.log('Cerco ingredienti errati nel database locale SQLite...\n');

errorIds.forEach((id, index) => {
    const ingredient = db.prepare('SELECT * FROM Ingredients WHERE id = ?').get(id);

    if (ingredient) {
        console.log(`✓ TROVATO [${index + 1}]:`);
        console.log(`  Nome: "${ingredient.name}"`);
        console.log(`  ID: ${id}`);
        console.log(`  Categoria: ${ingredient.categoryId}\n`);
    } else {
        console.log(`✗ NON TROVATO [${index + 1}]: ID ${id}\n`);
    }
});

// Verifica se ci sono altri ingredienti sospetti
console.log('='.repeat(80));
console.log('\n🔍 Cerco altri ingredienti con pattern sospetti...\n');

const suspiciousPatterns = [
    'frullare%',
    '%marinatura:%',
    'soffriggere%',
    '%100 gr%',
    '%mango%olio%'
];

const foundSuspicious = [];

suspiciousPatterns.forEach(pattern => {
    const results = db.prepare(`
    SELECT id, name FROM Ingredients 
    WHERE LOWER(name) LIKE LOWER(?)
  `).all(pattern);

    results.forEach(ing => {
        if (!foundSuspicious.find(i => i.id === ing.id)) {
            foundSuspicious.push(ing);
        }
    });
});

if (foundSuspicious.length > 0) {
    console.log(`Trovati ${foundSuspicious.length} ingredienti con pattern sospetti:\n`);
    foundSuspicious.forEach((ing, idx) => {
        console.log(`${idx + 1}. "${ing.name}" (ID: ${ing.id})`);
    });
} else {
    console.log('Nessun altro ingrediente sospetto trovato.');
}

db.close();

console.log('\n' + '='.repeat(80));
console.log('\n📝 Ora controllare il database Turso con lo script apposito.\n');
