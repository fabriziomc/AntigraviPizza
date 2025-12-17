// ============================================
// NORMALIZE PREPARATION INGREDIENT CATEGORIES
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
        'Condimenti': 'Salsa'
    };

    return categoryMap[category] || 'Altro';
}

async function normalizePreparationCategories() {
    console.log('🔧 Normalizing preparation ingredient categories...');

    const db = new Database(dbPath);

    try {
        // Get all preparations
        const preparations = db.prepare('SELECT id, name, ingredients FROM Preparations').all();
        console.log(`\n📊 Found ${preparations.length} preparations`);

        let totalUpdated = 0;
        const categoriesFound = new Set();

        const updateStmt = db.prepare('UPDATE Preparations SET ingredients = ? WHERE id = ?');

        preparations.forEach(prep => {
            try {
                const ingredients = JSON.parse(prep.ingredients);
                let modified = false;

                ingredients.forEach(ing => {
                    if (ing.category) {
                        categoriesFound.add(ing.category);
                        const normalized = normalizeCategory(ing.category);
                        if (normalized !== ing.category) {
                            console.log(`  ${prep.name}: ${ing.name} (${ing.category} → ${normalized})`);
                            ing.category = normalized;
                            modified = true;
                        }
                    }
                });

                if (modified) {
                    updateStmt.run(JSON.stringify(ingredients), prep.id);
                    totalUpdated++;
                }
            } catch (error) {
                console.error(`  ❌ Error processing ${prep.name}:`, error.message);
            }
        });

        console.log(`\n✅ Updated ${totalUpdated} preparations`);
        console.log(`\n📊 Categories found:`, Array.from(categoriesFound).sort());

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

normalizePreparationCategories().catch(console.error);
