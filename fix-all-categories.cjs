// Fix all categories in recipes baseIngredients
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

console.log('🔧 Fixing Recipe Categories...\n');

// Category mapping
const categoryMap = {
    'Carne': 'Carni e Salumi',
    'Salsa': 'Basi e Salse',
    'Base': 'Basi e Salse',
    'Verdure': 'Verdure e Ortaggi',
    'Erbe': 'Erbe e Spezie',
    'Spezie': 'Erbe e Spezie',
    'Aromi': 'Erbe e Spezie',
    'Pesce': 'Pesce e Frutti di Mare',
    'Frutta': 'Frutta e Frutta Secca',
    'Croccante': 'Altro',
    'Finish': 'Altro',
    'Oli': 'Altro'
};

// Get all recipes
const recipes = db.prepare('SELECT id, name, baseIngredients FROM Recipes').all();
console.log(`Found ${recipes.length} recipes to check\n`);

let updatedCount = 0;
const updateStmt = db.prepare('UPDATE Recipes SET baseIngredients = ? WHERE id = ?');

recipes.forEach(recipe => {
    if (!recipe.baseIngredients) return;

    let baseIngredients;
    try {
        baseIngredients = JSON.parse(recipe.baseIngredients);
    } catch (e) {
        console.warn(`⚠️  Skipping recipe "${recipe.name}": Invalid JSON`);
        return;
    }

    let hasChanges = false;

    // Check and update categories
    baseIngredients.forEach(ingredient => {
        if (ingredient.category && categoryMap[ingredient.category]) {
            console.log(`  📝 "${recipe.name}": ${ingredient.name}`);
            console.log(`     ${ingredient.category} → ${categoryMap[ingredient.category]}`);
            ingredient.category = categoryMap[ingredient.category];
            hasChanges = true;
        }
    });

    // Update if changes were made
    if (hasChanges) {
        updateStmt.run(JSON.stringify(baseIngredients), recipe.id);
        updatedCount++;
    }
});

console.log(`\n✅ Updated ${updatedCount} recipes`);

// Verify - show remaining categories
console.log('\n=== VERIFICATION ===');
const allRecipes = db.prepare('SELECT baseIngredients FROM Recipes WHERE baseIngredients IS NOT NULL').all();
const categoriesInUse = new Set();

allRecipes.forEach(recipe => {
    try {
        const ingredients = JSON.parse(recipe.baseIngredients);
        ingredients.forEach(ing => {
            if (ing.category) {
                categoriesInUse.add(ing.category);
            }
        });
    } catch (e) {
        // Skip invalid JSON
    }
});

console.log('Categories in use after migration:');
Array.from(categoriesInUse).sort().forEach(cat => {
    console.log(`  - ${cat}`);
});

db.close();
console.log('\n✅ Done!');
