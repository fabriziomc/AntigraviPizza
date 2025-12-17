// ============================================
// FIX MISCATEGORIZED INGREDIENTS
// ============================================

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

// Mapping of ingredient names to correct categories
const INGREDIENT_CATEGORY_MAP = {
    // Erbe e Spezie
    'Rosmarino': 'Erbe e Spezie',
    'Basilico': 'Erbe e Spezie',
    'Basilico fresco': 'Erbe e Spezie',
    'Origano': 'Erbe e Spezie',
    'Timo': 'Erbe e Spezie',
    'Prezzemolo': 'Erbe e Spezie',
    'Salvia': 'Erbe e Spezie',
    'Menta': 'Erbe e Spezie',
    'Peperoncino': 'Erbe e Spezie',
    'Pepe': 'Erbe e Spezie',
    'Pepe nero': 'Erbe e Spezie',
    'Sale': 'Erbe e Spezie',
    'Aglio': 'Erbe e Spezie',

    // Verdure
    'Sedano': 'Verdure',
    'Carote': 'Verdure',
    'Cipolla': 'Verdure',
    'Cipolle': 'Verdure',
    'Pomodoro': 'Verdure',
    'Pomodori': 'Verdure',
    'Pomodorini': 'Verdure',
    'Zucchine': 'Verdure',
    'Melanzane': 'Verdure',
    'Peperoni': 'Verdure',
    'Funghi': 'Verdure',
    'Rucola': 'Verdure',
    'Spinaci': 'Verdure',
    'Lattuga': 'Verdure',
    'Radicchio': 'Verdure',

    // Salsa
    'Olio': 'Salsa',
    'Olio EVO': 'Salsa',
    'Aceto': 'Salsa',
    'Limone': 'Salsa',

    // Altro (frutta secca, semi, etc)
    'Noci': 'Altro',
    'Mandorle': 'Altro',
    'Pistacchi': 'Altro',
    'Pinoli': 'Altro',
    'Semi di sesamo': 'Altro',
    'Zucchero': 'Altro',
    'Miele': 'Altro'
};

function fixIngredientCategory(ingredientName) {
    // Check exact match first
    if (INGREDIENT_CATEGORY_MAP[ingredientName]) {
        return INGREDIENT_CATEGORY_MAP[ingredientName];
    }

    // Check partial matches (case insensitive)
    const lowerName = ingredientName.toLowerCase();
    for (const [key, category] of Object.entries(INGREDIENT_CATEGORY_MAP)) {
        if (lowerName.includes(key.toLowerCase())) {
            return category;
        }
    }

    return null; // No change
}

async function fixMiscategorizedIngredients() {
    console.log('🔧 Fixing miscategorized ingredients...\n');

    const db = new Database(dbPath);

    try {
        let totalFixed = 0;

        // Fix in Recipes
        console.log('=== RECIPES ===');
        const recipes = db.prepare('SELECT id, name, baseIngredients FROM Recipes').all();
        const updateRecipe = db.prepare('UPDATE Recipes SET baseIngredients = ? WHERE id = ?');

        recipes.forEach(recipe => {
            try {
                const ingredients = JSON.parse(recipe.baseIngredients);
                let modified = false;

                ingredients.forEach(ing => {
                    const correctCategory = fixIngredientCategory(ing.name);
                    if (correctCategory && ing.category !== correctCategory) {
                        console.log(`  ${recipe.name}: ${ing.name} (${ing.category} → ${correctCategory})`);
                        ing.category = correctCategory;
                        modified = true;
                        totalFixed++;
                    }
                });

                if (modified) {
                    updateRecipe.run(JSON.stringify(ingredients), recipe.id);
                }
            } catch (error) {
                console.error(`  ❌ Error processing recipe ${recipe.name}:`, error.message);
            }
        });

        // Fix in Preparations
        console.log('\n=== PREPARATIONS ===');
        const preparations = db.prepare('SELECT id, name, ingredients FROM Preparations').all();
        const updatePrep = db.prepare('UPDATE Preparations SET ingredients = ? WHERE id = ?');

        preparations.forEach(prep => {
            try {
                const ingredients = JSON.parse(prep.ingredients);
                let modified = false;

                ingredients.forEach(ing => {
                    const correctCategory = fixIngredientCategory(ing.name);
                    if (correctCategory && ing.category !== correctCategory) {
                        console.log(`  ${prep.name}: ${ing.name} (${ing.category} → ${correctCategory})`);
                        ing.category = correctCategory;
                        modified = true;
                        totalFixed++;
                    }
                });

                if (modified) {
                    updatePrep.run(JSON.stringify(ingredients), prep.id);
                }
            } catch (error) {
                console.error(`  ❌ Error processing preparation ${prep.name}:`, error.message);
            }
        });

        console.log(`\n✅ Fixed ${totalFixed} ingredient categorizations`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

fixMiscategorizedIngredients().catch(console.error);
