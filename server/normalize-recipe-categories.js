// ============================================
// NORMALIZE RECIPE INGREDIENT CATEGORIES
// ============================================

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../antigravipizza.db');

function normalizeCategory(category) {
    if (!category) return 'Altro';

    const categoryMap = {
        // Standard categories (pass through)
        'Formaggi': 'Formaggi',
        'Carne': 'Carne',
        'Verdure': 'Verdure',
        'Salsa': 'Salsa',
        'Erbe e Spezie': 'Erbe e Spezie',
        'Pesce': 'Pesce',
        'Impasto': 'Impasto',
        'Altro': 'Altro',

        // Non-standard mappings
        'Croccante': 'Altro',
        'Oli': 'Salsa',
        'Finish': 'Erbe e Spezie',
        'Salse': 'Salsa',
        'Creme': 'Salsa',
        'Basi': 'Salsa',
        'Dolci': 'Altro',
        'Preparazioni Base': 'Altro',
        'Condimenti': 'Salsa',
        'Erbe': 'Erbe e Spezie',
        'Spezie': 'Erbe e Spezie',
        'Frutta Secca': 'Altro',
        'Latticini': 'Formaggi'
    };

    return categoryMap[category] || 'Altro';
}

async function normalizeRecipeCategories() {
    console.log('🔧 Normalizing recipe ingredient categories...');

    const db = new Database(dbPath);

    try {
        // Get all recipes
        const recipes = db.prepare('SELECT id, name, baseIngredients FROM Recipes').all();
        console.log(`\n📊 Found ${recipes.length} recipes`);

        let totalUpdated = 0;
        const categoriesFound = new Set();

        const updateStmt = db.prepare('UPDATE Recipes SET baseIngredients = ? WHERE id = ?');

        recipes.forEach(recipe => {
            try {
                const ingredients = JSON.parse(recipe.baseIngredients);
                let modified = false;

                ingredients.forEach(ing => {
                    if (ing.category) {
                        categoriesFound.add(ing.category);
                        const normalized = normalizeCategory(ing.category);
                        if (normalized !== ing.category) {
                            console.log(`  ${recipe.name}: ${ing.name} (${ing.category} → ${normalized})`);
                            ing.category = normalized;
                            modified = true;
                        }
                    }
                });

                if (modified) {
                    updateStmt.run(JSON.stringify(ingredients), recipe.id);
                    totalUpdated++;
                }
            } catch (error) {
                console.error(`  ❌ Error processing ${recipe.name}:`, error.message);
            }
        });

        console.log(`\n✅ Updated ${totalUpdated} recipes`);
        console.log(`\n📊 Categories found:`, Array.from(categoriesFound).sort());

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

normalizeRecipeCategories().catch(console.error);
