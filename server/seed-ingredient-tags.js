import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { INGREDIENT_TAG_MAPPING } from './data/ingredient-tag-mapping.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../antigravipizza.db');

console.log('🏷️  Seeding Ingredient Tags');
console.log('Database path:', dbPath);
console.log('');

const db = new Database(dbPath);

try {
    const updateStmt = db.prepare('UPDATE Ingredients SET tags = ? WHERE name = ?');

    let updated = 0;
    let notFound = 0;
    let skipped = 0;

    // Get all ingredients from database to check what exists
    const allIngredients = db.prepare('SELECT id, name, tags FROM Ingredients').all();
    const ingredientNames = new Set(allIngredients.map(i => i.name));

    console.log(`📊 Total ingredients in mapping: ${Object.keys(INGREDIENT_TAG_MAPPING).length}`);
    console.log(`📊 Total ingredients in database: ${allIngredients.length}`);
    console.log('');

    for (const [name, tags] of Object.entries(INGREDIENT_TAG_MAPPING)) {
        if (!ingredientNames.has(name)) {
            console.log(`⚠️  Not found in DB: ${name}`);
            notFound++;
            continue;
        }

        const tagsJson = JSON.stringify(tags);
        const result = updateStmt.run(tagsJson, name);

        if (result.changes > 0) {
            console.log(`✓ ${name}: [${tags.join(', ')}]`);
            updated++;
        } else {
            skipped++;
        }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Not found in DB: ${notFound}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log('='.repeat(60));

    // Check coverage
    const ingredientsWithTags = db.prepare("SELECT COUNT(*) as count FROM Ingredients WHERE tags IS NOT NULL AND tags != '[]'").get();
    const totalIngredients = db.prepare('SELECT COUNT(*) as count FROM Ingredients').get();
    const coverage = (ingredientsWithTags.count / totalIngredients.count * 100).toFixed(1);

    console.log('');
    console.log(`📈 Coverage: ${ingredientsWithTags.count}/${totalIngredients.count} (${coverage}%)`);

    if (coverage < 100) {
        console.log('');
        console.log('⚠️  Ingredients without tags:');
        const withoutTags = db.prepare("SELECT name FROM Ingredients WHERE tags IS NULL OR tags = '[]' ORDER BY name").all();
        withoutTags.forEach(ing => {
            console.log(`   - ${ing.name}`);
        });
    }

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
} finally {
    db.close();
    console.log('');
    console.log('✅ Seed completed');
}
