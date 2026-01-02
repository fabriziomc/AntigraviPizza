// Migrate Preparations to use ingredient references (ingredientId)
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🔄 Migrating Preparations to use ingredient references...\n');

try {
    // Get all ingredients for lookup
    const ingredients = db.prepare('SELECT id, name FROM Ingredients').all();
    const ingredientMap = {};
    ingredients.forEach(ing => {
        ingredientMap[ing.name.toLowerCase()] = ing.id;
    });

    console.log(`📚 Loaded ${ingredients.length} ingredients for reference\n`);

    // Get all preparations
    const preparations = db.prepare('SELECT * FROM Preparations').all();
    const updateStmt = db.prepare('UPDATE Preparations SET ingredients = ? WHERE id = ?');

    let migrated = 0;
    let ingredientsNotFound = new Set();
    let totalIngredients = 0;

    preparations.forEach(prep => {
        try {
            const ings = JSON.parse(prep.ingredients);
            const newIngs = [];

            ings.forEach(ing => {
                totalIngredients++;
                const ingredientName = ing.name.toLowerCase();
                const ingredientId = ingredientMap[ingredientName];

                if (ingredientId) {
                    // Convert to reference format
                    newIngs.push({
                        ingredientId: ingredientId,
                        quantity: ing.quantity,
                        unit: ing.unit,
                        perPortion: ing.perPortion || null
                    });
                } else {
                    ingredientsNotFound.add(ing.name);
                    console.log(`⚠️  ${prep.name}: Ingredient "${ing.name}" not found in Ingredients table`);
                    // Keep original format for now
                    newIngs.push(ing);
                }
            });

            updateStmt.run(JSON.stringify(newIngs), prep.id);
            migrated++;

        } catch (error) {
            console.error(`❌ Error processing ${prep.name}:`, error.message);
        }
    });

    console.log(`\n✅ Migrated ${migrated} preparations`);
    console.log(`📊 Total ingredients processed: ${totalIngredients}`);

    if (ingredientsNotFound.size > 0) {
        console.log(`\n⚠️  ${ingredientsNotFound.size} ingredients not found in Ingredients table:`);
        Array.from(ingredientsNotFound).sort().forEach(name => {
            console.log(`   - ${name}`);
        });
    } else {
        console.log('\n✅ All ingredients found and converted to references!');
    }

} catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
} finally {
    db.close();
}
