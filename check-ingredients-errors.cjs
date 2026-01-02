const Database = require('better-sqlite3').default || require('better-sqlite3');
const fs = require('fs');
const db = new Database('./antigravipizza.db');

let output = '';
output += '\n=== ANALISI DETTAGLIATA INGREDIENTI ===\n\n';

// Ottieni tutti gli ingredienti ordinati per lunghezza nome (decrescente)
const ingredients = db.prepare(`
  SELECT * 
  FROM Ingredients 
  ORDER BY length(name) DESC
`).all();

output += `Totale ingredienti: ${ingredients.length}\n\n`;

// Analizza ingredienti con nomi sospetti
output += '=== TOP 50 INGREDIENTI PER LUNGHEZZA NOME ===\n\n';

ingredients.slice(0, 50).forEach((ing, index) => {
    output += `\n${'-'.repeat(80)}\n`;
    output += `[${index + 1}] ID: ${ing.id} | Lunghezza nome: ${ing.name.length} caratteri\n`;
    output += `Nome: ${ing.name}\n`;
    output += `Categoria ID: ${ing.categoryId}\n`;
    if (ing.subcategory) output += `Subcategoria: ${ing.subcategory}\n`;
    if (ing.tags) output += `Tags: ${ing.tags}\n`;
});

// Cerca ingredienti con caratteristiche specifiche di istruzioni
output += '\n\n' + '='.repeat(80) + '\n';
output += '=== RICERCA PATTERN SPECIFICI ===\n\n';

const patternsToCheck = [
    { name: 'Contiene "poi"', pattern: /\bpoi\b/i },
    { name: 'Contiene numeri + "minuti"', pattern: /\d+\s*minut/i },
    { name: 'Contiene temperature (gradi/°)', pattern: /\d+\s*(gradi|°c|°)/i },
    { name: 'Inizia con verbo imperativo', pattern: /^(stendere|spalmare|aggiungere|cuocere|mettere|tagliare|grattugiare|affettare|tritare)/i },
    { name: 'Contiene "fino a"', pattern: /fino\s+a/i },
    { name: 'Contiene "quando"', pattern: /quando/i },
    { name: 'Contiene "forno"', pattern: /\bforno\b/i },
    { name: 'Contiene multiple virgole (3+)', pattern: /,.*,.*,/i },
    { name: 'Troppo lungo (>80 caratteri)', test: (ing) => ing.name.length > 80 },
    { name: 'Parentesi con istruzioni', pattern: /\([^)]{30,}\)/i }
];

const foundByPattern = {};

patternsToCheck.forEach(checker => {
    const matches = ingredients.filter(ing => {
        if (checker.pattern) {
            return checker.pattern.test(ing.name);
        } else if (checker.test) {
            return checker.test(ing);
        }
        return false;
    });

    if (matches.length > 0) {
        foundByPattern[checker.name] = matches;
        output += `\n📌 ${checker.name}: ${matches.length} risultati\n`;
        matches.forEach(ing => {
            output += `   - ID ${ing.id}: ${ing.name.substring(0, 100)}${ing.name.length > 100 ? '...' : ''}\n`;
        });
    }
});

// Crea un set di tutti gli ID sospetti
const allSuspiciousIds = new Set();
Object.values(foundByPattern).forEach(matches => {
    matches.forEach(ing => allSuspiciousIds.add(ing.id));
});

if (allSuspiciousIds.size > 0) {
    output += '\n\n' + '='.repeat(80) + '\n';
    output += '=== RIEPILOGO: ID SOSPETTI DA VERIFICARE ===\n';
    output += '='.repeat(80) + '\n';
    output += Array.from(allSuspiciousIds).sort().join(', ') + '\n';
    output += `\nTotale: ${allSuspiciousIds.size} ingredienti da verificare\n`;

    // Mostra dettagli completi per ogni ingrediente sospetto
    output += '\n\n' + '='.repeat(80) + '\n';
    output += '=== DETTAGLI COMPLETI INGREDIENTI SOSPETTI ===\n';
    output += '='.repeat(80) + '\n';

    const suspiciousDetails = ingredients.filter(ing => allSuspiciousIds.has(ing.id));
    suspiciousDetails.forEach((ing, index) => {
        output += `\n\n[${index + 1}] ID: ${ing.id}\n`;
        output += `Nome: ${ing.name}\n`;
        output += `Categoria: ${ing.categoryId}\n`;
        if (ing.subcategory) output += `Subcategoria: ${ing.subcategory}\n`;
        if (ing.tags) output += `Tags: ${ing.tags}\n`;
        output += `Lunghezza: ${ing.name.length} caratteri\n`;
    });
} else {
    output += '\n\nNessun ingrediente sospetto trovato con i pattern specificati.\n';
}

// Salva il report in un file
fs.writeFileSync('ingredienti-sospetti-report.txt', output);
console.log('Report salvato in: ingredienti-sospetti-report.txt');
console.log(`Ingredienti analizzati: ${ingredients.length}`);
console.log(`Ingredienti sospetti trovati: ${allSuspiciousIds.size}`);

db.close();
