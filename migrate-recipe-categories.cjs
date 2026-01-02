const Database = require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('🔧 Migrating recipe ingredient categories to standard format...\n');

// Category mapping: old -> new
const categoryMap = {
    'Aromi': 'Erbe e Spezie',
    'Base': 'Basi e Salse',
    'Carne': 'Carni e Salumi',
    'Croccante': 'Altro',
    'Erbe': 'Erbe e Spezie',
    'Frutta': 'Frutta e Frutta Secca',
    'Pesce': 'Pesce e Frutti di Mare',
    'Semi': 'Frutta e Frutta Secca',
    'Verdure': 'Verdure e Ortaggi'
};

const recipes = db.prepare('SELECT * FROM Recipes').all();
let updated = 0;

recipes.forEach(recipe => {
    try {
        const baseIngredients = JSON.parse(recipe.baseIngredients);
        let modified = false;

        baseIngredients.forEach(ing => {
            if (ing.category && categoryMap[ing.category]) {
                console.log(`  ${recipe.name}: "${ing.category}" -> "${categoryMap[ing.category]}"`);
                ing.category = categoryMap[ing.category];
                modified = true;
            }
        });

        if (modified) {
            const stmt = db.prepare('UPDATE Recipes SET baseIngredients = ? WHERE id = ?');
            stmt.run(JSON.stringify(baseIngredients), recipe.id);
            updated++;
        }
    } catch (e) {
        console.error(`Error processing recipe ${recipe.name}:`, e.message);
    }
});

db.close();
console.log(`\n✅ Migration complete: ${updated} recipes updated`);
