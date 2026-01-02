const Database = require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('=== INGREDIENTS CATEGORIES ===');
const ingredientCats = new Set();
const ings = db.prepare('SELECT DISTINCT c.name FROM Ingredients i JOIN Categories c ON i.categoryId = c.id').all();
ings.forEach(r => ingredientCats.add(r.name));
console.log('Categories in Ingredients table:');
Array.from(ingredientCats).sort().forEach(c => console.log(`  - ${c}`));

console.log('\n=== RECIPE INGREDIENTS CATEGORIES ===');
const recipeCats = new Set();
const recipes = db.prepare('SELECT baseIngredients FROM Recipes').all();
recipes.forEach(r => {
    try {
        const baseIngs = JSON.parse(r.baseIngredients);
        baseIngs.forEach(ing => {
            if (ing.category) recipeCats.add(ing.category);
        });
    } catch (e) { }
});
console.log('Categories in Recipe baseIngredients:');
Array.from(recipeCats).sort().forEach(c => console.log(`  - ${c}`));

db.close();
