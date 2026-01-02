import { getDb } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportPreparationsForReview() {
    console.log('📋 Exporting preparations for ingredient review...\n');

    const db = getDb();
    const isTurso = typeof db?.execute === 'function';

    try {
        let preparations;

        if (isTurso) {
            const result = await db.execute(`
                SELECT id, name, category, ingredients, description, 
                       yield, prepTime, difficulty, instructions, tips
                FROM preparations 
                ORDER BY category, name
            `);
            preparations = result.rows;
        } else {
            preparations = db.prepare(`
                SELECT id, name, category, ingredients, description,
                       yield, prepTime, difficulty, instructions, tips
                FROM preparations
                ORDER BY category, name
            `).all();
        }

        console.log(`Found ${preparations.length} preparations\n`);

        // Count preparations without ingredients
        const withoutIngredients = preparations.filter(p => {
            if (!p.ingredients) return true;
            try {
                const parsed = JSON.parse(p.ingredients);
                return !parsed || parsed.length === 0;
            } catch {
                return true;
            }
        });

        console.log(`⚠️  Preparations WITHOUT ingredients: ${withoutIngredients.length}\n`);

        // Create export object
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            totalCount: preparations.length,
            missingIngredientsCount: withoutIngredients.length,
            preparations: preparations.map(prep => {
                let ingredientsList = [];
                let hasIngredients = false;

                try {
                    if (prep.ingredients) {
                        ingredientsList = JSON.parse(prep.ingredients);
                        hasIngredients = ingredientsList && ingredientsList.length > 0;
                    }
                } catch (e) {
                    console.error(`Error parsing ingredients for ${prep.name}:`, e.message);
                }

                return {
                    id: prep.id,
                    name: prep.name,
                    category: prep.category,
                    description: prep.description,
                    yield: prep.yield,
                    prepTime: prep.prepTime,
                    difficulty: prep.difficulty,
                    ingredients: ingredientsList,
                    instructions: prep.instructions ? JSON.parse(prep.instructions) : [],
                    tips: prep.tips ? JSON.parse(prep.tips) : [],
                    _hasIngredients: hasIngredients,
                    _needsIngredients: !hasIngredients
                };
            })
        };

        // Save to file
        const outputPath = path.join(__dirname, 'preparations-export.json');
        fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

        console.log(`✅ Export saved to: ${outputPath}\n`);

        // Print summary by category
        console.log('📊 Summary by category:\n');
        const byCategory = {};
        preparations.forEach(prep => {
            if (!byCategory[prep.category]) {
                byCategory[prep.category] = { total: 0, withIngredients: 0, withoutIngredients: 0 };
            }
            byCategory[prep.category].total++;

            try {
                const ingredients = prep.ingredients ? JSON.parse(prep.ingredients) : [];
                if (ingredients && ingredients.length > 0) {
                    byCategory[prep.category].withIngredients++;
                } else {
                    byCategory[prep.category].withoutIngredients++;
                }
            } catch {
                byCategory[prep.category].withoutIngredients++;
            }
        });

        Object.entries(byCategory).sort().forEach(([category, stats]) => {
            console.log(`${category}:`);
            console.log(`  Total: ${stats.total}`);
            console.log(`  ✅ With ingredients: ${stats.withIngredients}`);
            console.log(`  ⚠️  WITHOUT ingredients: ${stats.withoutIngredients}`);
            console.log('');
        });

        // List preparations without ingredients
        if (withoutIngredients.length > 0) {
            console.log('\n⚠️  Preparations that need ingredients:\n');
            withoutIngredients.forEach(prep => {
                console.log(`   - ${prep.name} (${prep.category})`);
            });
        }

        console.log(`\n✨ Export complete! You can now edit ${outputPath} to add missing ingredients.\n`);

    } catch (error) {
        console.error('❌ Export failed:', error.message);
        process.exit(1);
    }
}

exportPreparationsForReview().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
