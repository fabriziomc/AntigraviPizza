// Migrate recipes and preparations to use ingredientId instead of embedded name+category
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

console.log('🔧 Migrating to Ingredient ID References...\n');

// Get all ingredients and create name → id mapping
const ingredients = db.prepare('SELECT id, name FROM Ingredients').all();
const ingredientMap = {};
ingredients.forEach(ing => {
    ingredientMap[ing.name.toLowerCase().trim()] = ing.id;
});

console.log(`📋 Loaded ${ingredients.length} ingredients\n`);

// ============================================
// MIGRATE RECIPES
// ============================================
console.log('🍕 Migrating Recipes...\n');

const recipes = db.prepare('SELECT id, name, baseIngredients FROM Recipes WHERE baseIngredients IS NOT NULL').all();
let recipesUpdated = 0;
const updateRecipeStmt = db.prepare('UPDATE Recipes SET baseIngredients = ? WHERE id = ?');

recipes.forEach(recipe => {
    try {
        const baseIngredients = JSON.parse(recipe.baseIngredients);
        let hasChanges = false;

        baseIngredients.forEach(ing => {
            // If it has name but not ingredientId, migrate it
            if (ing.name && !ing.ingredientId) {
                const ingName = ing.name.toLowerCase().trim();
                const ingredientId = ingredientMap[ingName];

                if (ingredientId) {
                    // Replace with ingredientId reference
                    ing.ingredientId = ingredientId;
                    // Remove embedded name and category
                    delete ing.name;
                    delete ing.category;
                    hasChanges = true;
                    console.log(`  ✓ "${recipe.name}": ${ingName} → ID`);
                } else {
                    console.warn(`  ⚠️  "${recipe.name}": Ingredient not found: ${ing.name}`);
                }
            }
        });

        if (hasChanges) {
            updateRecipeStmt.run(JSON.stringify(baseIngredients), recipe.id);
            recipesUpdated++;
        }
    } catch (e) {
        console.error(`  ❌ Error migrating recipe "${recipe.name}":`, e.message);
    }
});

console.log(`\n✅ Updated ${recipesUpdated} recipes\n`);

// ============================================
// MIGRATE PREPARATIONS
// ============================================
console.log('🥫 Migrating Preparations...\n');

const preparations = db.prepare('SELECT id, name, ingredients FROM Preparations WHERE ingredients IS NOT NULL').all();
let preparationsUpdated = 0;
const updatePrepStmt = db.prepare('UPDATE Preparations SET ingredients = ? WHERE id = ?');

preparations.forEach(prep => {
    try {
        const prepIngredients = JSON.parse(prep.ingredients);
        let hasChanges = false;

        prepIngredients.forEach(ing => {
            // If it has name but not ingredientId, migrate it
            if (ing.name && !ing.ingredientId) {
                const ingName = ing.name.toLowerCase().trim();
                const ingredientId = ingredientMap[ingName];

                if (ingredientId) {
                    // Replace with ingredientId reference
                    ing.ingredientId = ingredientId;
                    // Remove embedded name and category
                    delete ing.name;
                    delete ing.category;
                    hasChanges = true;
                    console.log(`  ✓ "${prep.name}": ${ingName} → ID`);
                } else {
                    console.warn(`  ⚠️  "${prep.name}": Ingredient not found: ${ing.name}`);
                }
            }
        });

        if (hasChanges) {
            updatePrepStmt.run(JSON.stringify(prepIngredients), prep.id);
            preparationsUpdated++;
        }
    } catch (e) {
        console.error(`  ❌ Error migrating preparation "${prep.name}":`, e.message);
    }
});

console.log(`\n✅ Updated ${preparationsUpdated} preparations\n`);

// ============================================
// VERIFICATION
// ============================================
console.log('=== VERIFICATION ===\n');

// Check recipes
const recipesAfter = db.prepare('SELECT baseIngredients FROM Recipes WHERE baseIngredients IS NOT NULL').all();
let recipesWithIds = 0;
let recipesWithEmbedded = 0;

recipesAfter.forEach(recipe => {
    try {
        const ingredients = JSON.parse(recipe.baseIngredients);
        ingredients.forEach(ing => {
            if (ing.ingredientId) recipesWithIds++;
            if (ing.name || ing.category) recipesWithEmbedded++;
        });
    } catch (e) {
        // Skip invalid JSON
    }
});

console.log(`Recipes:`);
console.log(`  ✓ Ingredients with ID: ${recipesWithIds}`);
console.log(`  ${recipesWithEmbedded > 0 ? '⚠️' : '✓'} Ingredients with embedded data: ${recipesWithEmbedded}\n`);

// Check preparations
const prepsAfter = db.prepare('SELECT ingredients FROM Preparations WHERE ingredients IS NOT NULL').all();
let prepsWithIds = 0;
let prepsWithEmbedded = 0;

prepsAfter.forEach(prep => {
    try {
        const ingredients = JSON.parse(prep.ingredients);
        ingredients.forEach(ing => {
            if (ing.ingredientId) prepsWithIds++;
            if (ing.name || ing.category) prepsWithEmbedded++;
        });
    } catch (e) {
        // Skip invalid JSON
    }
});

console.log(`Preparations:`);
console.log(`  ✓ Ingredients with ID: ${prepsWithIds}`);
console.log(`  ${prepsWithEmbedded > 0 ? '⚠️' : '✓'} Ingredients with embedded data: ${prepsWithEmbedded}\n`);

db.close();
console.log('✅ Migration complete!');
