// ============================================
// NORMALIZE INGREDIENT CATEGORIES
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

async function normalizeIngredientCategories() {
    console.log('🔧 Normalizing ingredient categories...');

    const db = new Database(dbPath);

    try {
        // Get all unique categories
        const categories = db.prepare('SELECT DISTINCT category FROM Ingredients').all();
        console.log('\n📊 Current categories:', categories.map(c => c.category));

        // Update each ingredient
        const updateStmt = db.prepare('UPDATE Ingredients SET category = ? WHERE category = ?');

        let updated = 0;
        categories.forEach(({ category }) => {
            const normalized = normalizeCategory(category);
            if (normalized !== category) {
                const result = updateStmt.run(normalized, category);
                console.log(`  ✓ ${category} → ${normalized} (${result.changes} ingredients)`);
                updated += result.changes;
            }
        });

        console.log(`\n✅ Normalized ${updated} ingredients`);

        // Show final categories
        const finalCategories = db.prepare('SELECT DISTINCT category FROM Ingredients ORDER BY category').all();
        console.log('\n📊 Final categories:', finalCategories.map(c => c.category));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

normalizeIngredientCategories().catch(console.error);
