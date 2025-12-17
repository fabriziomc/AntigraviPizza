// ============================================
// FIX MISCATEGORIZED INGREDIENTS - COMPREHENSIVE
// ============================================

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

// Comprehensive mapping of ingredient names to correct categories
const INGREDIENT_CATEGORY_MAP = {
    // === FORMAGGI ===
    'Pecorino': 'Formaggi',
    'Parmigiano': 'Formaggi',

    // === LATTICINI → ALTRO (dairy products) ===
    'Burro': 'Altro',
    'Latte': 'Altro',
    'Latte intero': 'Altro',
    'Panna': 'Altro',
    'Panna fresca': 'Altro',
    'Yogurt': 'Altro',
    'Uova': 'Altro',
    'Crema di burrata': 'Altro',

    // === ERBE E SPEZIE ===
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
    'Alloro': 'Erbe e Spezie',
    'Noce moscata': 'Erbe e Spezie',
    'Paprika affumicata': 'Erbe e Spezie',
    'Zenzero': 'Erbe e Spezie',
    'Wasabi': 'Erbe e Spezie',
    'Senape': 'Erbe e Spezie',

    // === VERDURE ===
    'Sedano': 'Verdure',
    'Carota': 'Verdure',
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
    'Piselli': 'Verdure',
    'Ceci': 'Verdure',
    'Patate': 'Verdure',
    'Patate viola': 'Verdure',
    'Finocchi': 'Verdure',
    'Friarielli': 'Verdure',
    'Cavolo nero': 'Verdure',
    'Verza': 'Verdure',
    'Porri': 'Verdure',
    'Barbabietola': 'Verdure',

    // === SALSA ===
    'Olio': 'Salsa',
    'Olio EVO': 'Salsa',
    'Aceto': 'Salsa',
    'Limone': 'Salsa',
    'Lime': 'Salsa',
    'Crema di zucca': 'Salsa',
    'Crema di ceci': 'Salsa',
    'Crema di pistacchio': 'Salsa',
    'Pasta di tartufo nero': 'Salsa',
    'Salsa di Soia': 'Salsa',
    'Salsa di soia': 'Salsa',
    'Tabasco': 'Salsa',
    'Worchester': 'Salsa',

    // === CARNE ===
    'Carne': 'Carne',
    'Carne macinata': 'Carne',
    'Carpaccio di manzo': 'Carne',
    'Fassona': 'Carne',
    'Anatra': 'Carne',
    'Brodo di carne': 'Carne',

    // === PESCE ===
    'Baccalà': 'Pesce',
    'Stoccafisso ammollato': 'Pesce',
    'Filetti di tonno': 'Pesce',
    'Gamberi': 'Pesce',

    // === IMPASTO ===
    'Farina': 'Impasto',
    'Farina 00': 'Impasto',
    'Farina Grano saraceno': 'Impasto',
    'Farina di castagne': 'Impasto',

    // === ALTRO (frutta, semi, dolcificanti, etc) ===
    'Noci': 'Altro',
    'Mandorle': 'Altro',
    'Granella di mandorle': 'Altro',
    'Pistacchi': 'Altro',
    'Pistacchi di Bronte': 'Altro',
    'Pinoli': 'Altro',
    'Semi di sesamo': 'Altro',
    'Semi di Sesamo': 'Altro',
    'Zucchero': 'Altro',
    'Zucchero di canna': 'Altro',
    'Miele': 'Altro',
    'Miele di acacia': 'Altro',
    'Miele di castagno': 'Altro',
    'Capperi': 'Altro',
    'Olive taggiasche': 'Altro',
    'Ananas': 'Altro',
    'Arancia': 'Altro',
    'Avocado': 'Altro',
    'Fichi': 'Altro',
    'Kiwi': 'Altro',
    'Mango': 'Altro',
    'Melone': 'Altro',
    'Pere': 'Altro',
    'Cocco': 'Altro',
    'Agar Agar': 'Altro',
    'Vino rosso': 'Altro'
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
