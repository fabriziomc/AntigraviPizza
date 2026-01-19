const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

console.log('🔍 Checking for admin user and their pizzas...\n');

// Find admin user
const adminUser = db.prepare(`
    SELECT id, email, name 
    FROM Users 
    WHERE email = 'admin@antigravipizza.local'
`).get();

if (!adminUser) {
    console.log('❌ Admin user not found');
    db.close();
    process.exit(1);
}

console.log('✅ Admin user found:', adminUser);
console.log('\n📋 Fetching last 5 recipes for admin user...\n');

// Get last 5 recipes for admin user
const recipes = db.prepare(`
    SELECT id, name, description, baseIngredients, preparations, createdAt
    FROM Recipes
    WHERE userId = ?
    ORDER BY createdAt DESC
    LIMIT 5
`).all(adminUser.id);

console.log(`Found ${recipes.length} recipes\n`);

recipes.forEach((recipe, index) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`RECIPE ${index + 1}: ${recipe.name}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`ID: ${recipe.id}`);
    console.log(`Created: ${new Date(recipe.createdAt).toLocaleString()}`);
    console.log(`\nDescription:`);
    console.log(recipe.description);
    
    console.log(`\nBase Ingredients (raw):`);
    console.log(recipe.baseIngredients);
    
    try {
        const ingredients = JSON.parse(recipe.baseIngredients);
        console.log(`\nParsed Ingredients (${ingredients.length} total):`);
        ingredients.forEach((ing, i) => {
            console.log(`  ${i + 1}. ${ing.name} (ID: ${ing.id}) - ${ing.quantity}${ing.unit} - PostBake: ${ing.postBake || 0}`);
        });
        
        // Check for duplicates
        const ingredientNames = ingredients.map(i => i.name.toLowerCase());
        const duplicates = ingredientNames.filter((name, index) => ingredientNames.indexOf(name) !== index);
        if (duplicates.length > 0) {
            console.log(`\n⚠️  DUPLICATE INGREDIENTS FOUND: ${[...new Set(duplicates)].join(', ')}`);
        }
        
        // Check if name ingredients are in the ingredient list
        const nameWords = recipe.name.toLowerCase().split(/\s+/);
        const missingInName = nameWords.filter(word => 
            word.length > 4 && 
            !ingredientNames.some(ing => ing.includes(word))
        );
        if (missingInName.length > 0) {
            console.log(`\n⚠️  Ingredients mentioned in name but not in list: ${missingInName.join(', ')}`);
        }
        
    } catch (e) {
        console.log(`❌ Error parsing ingredients: ${e.message}`);
    }
    
    console.log(`\nPreparations (raw):`);
    console.log(recipe.preparations);
});

db.close();
console.log('\n\n✅ Analysis complete');
