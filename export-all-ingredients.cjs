const Database = require('better-sqlite3').default || require('better-sqlite3');
const fs = require('fs');
const db = new Database('./antigravipizza.db');

console.log('\n=== EXPORT COMPLETO INGREDIENTI ===\n');

// Esporta TUTTI gli ingredienti in un file per analisi visuale
const ingredients = db.prepare(`
  SELECT id, name, categoryId
  FROM Ingredients
  ORDER BY name
`).all();

let output = '='.repeat(100) + '\n';
output += 'LISTA COMPLETA INGREDIENTI (Ordinata alfabeticamente)\n';
output += '='.repeat(100) + '\n\n';
output += `Totale: ${ingredients.length} ingredienti\n\n`;

ingredients.forEach((ing, index) => {
    output += `${String(index + 1).padStart(3)}. ${ing.name}\n`;
    output += `     ID: ${ing.id}\n`;
    output += `     Categoria: ${ing.categoryId}\n\n`;
});

fs.writeFileSync('all-ingredients-list.txt', output);

console.log(`Esportati ${ingredients.length} ingredienti in: all-ingredients-list.txt`);
console.log('\n📋 Cerca manualmente i seguenti termini nel file:');
console.log('   - frullare');
console.log('   - marinatura');
console.log('   - soffriggere (✓ trovato)');
console.log('   - 100 gr (✓ trovato)');

db.close();
