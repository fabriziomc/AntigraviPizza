import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath, { readonly: true });

console.log('=== VERIFICA: Emulsione di aglio nero ===\n');

// Cerca la preparazione
const prep = db.prepare('SELECT * FROM preparations WHERE name = ?').get('Emulsione di aglio nero');

if (!prep) {
    console.log('❌ Preparazione NON trovata nel database');
    db.close();
    process.exit(1);
}

console.log(`✅ Preparazione trovata`);
console.log(`   ID: ${prep.id}`);
console.log(`   Nome: ${prep.name}`);
console.log(`   Categoria: ${prep.category}`);
console.log(`   Description: ${prep.description}`);

console.log('\n=== INGREDIENTI (campo JSON) ===');
console.log('Raw ingredients field:');
console.log(prep.ingredients);

try {
    const ingredients = JSON.parse(prep.ingredients || '[]');
    console.log(`\nNumero di ingredienti: ${ingredients.length}`);

    if (ingredients.length === 0) {
        console.log('❌ PROBLEMA: Nessun ingrediente trovato nel JSON!');
    } else {
        console.log('\nIngredienti trovati:');
        ingredients.forEach((ing, index) => {
            console.log(`\n${index + 1}. ${ing.name || 'NOME MANCANTE'}`);
            console.log(`   Quantità: ${ing.quantity || 'N/A'} ${ing.unit || ''}`);
            console.log(`   Categoria: ${ing.category || 'N/A'}`);
            console.log(`   Per porzione: ${ing.perPortion || 'N/A'}`);
        });

        // Verifica specifica per Aglio nero
        const aglioNero = ingredients.find(ing => ing.name && ing.name.toLowerCase() === 'aglio nero');
        if (aglioNero) {
            console.log('\n✅ TROVATO "Aglio nero" negli ingredienti della preparazione!');
        } else {
            console.log('\n❌ "Aglio nero" NON trovato negli ingredienti della preparazione!');
        }
    }
} catch (error) {
    console.error('❌ Errore nel parsing del JSON:', error.message);
}

// Verifica se "Aglio nero" esiste nella tabella ingredients
console.log('\n=== VERIFICA INGREDIENTE NELLA TABELLA INGREDIENTS ===');
const aglioNeroIng = db.prepare('SELECT * FROM ingredients WHERE name = ?').get('Aglio nero');
if (aglioNeroIng) {
    console.log('✅ "Aglio nero" trovato nella tabella ingredients');
    console.log(`   ID: ${aglioNeroIng.id}`);
    console.log(`   Categoria ID: ${aglioNeroIng.categoryId}`);
} else {
    console.log('❌ "Aglio nero" NON trovato nella tabella ingredients');
}

db.close();
