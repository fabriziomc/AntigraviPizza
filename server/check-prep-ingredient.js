const Database = require('better-sqlite3');
const db = new Database('./antigravipizza.db', { readonly: true });

console.log('=== INGREDIENTE AGLIO NERO ===');
const ing = db.prepare('SELECT * FROM ingredients WHERE name = ?').get('Aglio nero');
if (ing) {
    console.log(`ID: ${ing.id}`);
    console.log(`Nome: ${ing.name}`);
    console.log(`Categoria ID: ${ing.categoryId}`);
} else {
    console.log('NON TROVATO');
}

console.log('\n=== PREPARAZIONE EMULSIONE DI AGLIO NERO ===');
const prep = db.prepare('SELECT * FROM preparations WHERE name = ?').get('Emulsione di aglio nero');
if (prep) {
    console.log(`ID: ${prep.id}`);
    console.log(`Nome: ${prep.name}`);
    console.log(`Categoria: ${prep.category}`);

    console.log('\n=== INGREDIENTI DELLA PREPARAZIONE ===');
    const prepIngs = db.prepare(`
    SELECT pi.*, i.name as ingredientName 
    FROM preparation_ingredients pi 
    JOIN ingredients i ON pi.ingredientId = i.id 
    WHERE pi.preparationId = ?
  `).all(prep.id);

    if (prepIngs.length > 0) {
        prepIngs.forEach(ing => {
            console.log(`- ${ing.ingredientName} (quantity: ${ing.quantity} ${ing.unit})`);
        });
    } else {
        console.log('NESSUN INGREDIENTE TROVATO PER QUESTA PREPARAZIONE');
    }
} else {
    console.log('PREPARAZIONE NON TROVATA');
}

db.close();
