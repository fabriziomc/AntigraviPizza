// Migration: Assign archetype to legacy recipes based on their ingredients
import { getDb } from './db.js';

console.log('🔄 Migrating legacy recipes to assign archetypes...\n');

const db = getDb();
const isTurso = typeof db?.execute === 'function';

// Archetype detection logic based on ingredients
function detectArchetype(recipe) {
    const allIngredients = recipe.baseIngredients || [];
    const ingredientNames = allIngredients.map(ing =>
        (typeof ing === 'string' ? ing : ing.name || '').toLowerCase()
    );
    const recipeName = (recipe.name || '').toLowerCase();
    const description = (recipe.description || '').toLowerCase();

    // Check for specific archetype indicators

    // Mare (Seafood)
    const mareKeywords = ['tonno', 'alici', 'acciughe', 'salmone', 'gamberi', 'frutti di mare', 'pesce', 'vongole', 'cozze'];
    if (ingredientNames.some(ing => mareKeywords.some(kw => ing.includes(kw))) ||
        mareKeywords.some(kw => recipeName.includes(kw))) {
        return 'mare';
    }

    // Vegana (Vegan)
    const hasAnimalProducts = ingredientNames.some(ing =>
        ing.includes('formaggio') || ing.includes('mozzarella') ||
        ing.includes('prosciutto') || ing.includes('salame') ||
        ing.includes('carne') || ing.includes('latte') || ing.includes('uovo')
    );
    const veganKeywords = ['vegana', 'vegan'];
    if (!hasAnimalProducts && (veganKeywords.some(kw => recipeName.includes(kw)) ||
        ingredientNames.length > 3)) {
        return 'vegana';
    }

    // Piccante/Decisa (Spicy)
    const spicyKeywords = ['nduja', 'peperoncino', 'piccante', 'calabrese', 'diavola', 'hot'];
    if (ingredientNames.some(ing => spicyKeywords.some(kw => ing.includes(kw))) ||
        spicyKeywords.some(kw => recipeName.includes(kw))) {
        return 'piccante_decisa';
    }

    // Terra e Bosco (Earthy)
    const earthyKeywords = ['porcini', 'funghi', 'tartufo', 'salsiccia', 'castagne'];
    if (ingredientNames.some(ing => earthyKeywords.some(kw => ing.includes(kw))) ||
        earthyKeywords.some(kw => recipeName.includes(kw))) {
        return 'terra_bosco';
    }

    // Fresca/Estiva (Fresh/Summer)
    const freshKeywords = ['rucola', 'pomodorini', 'pachino', 'bufala', 'basilico fresco', 'verdure'];
    if (ingredientNames.some(ing => freshKeywords.some(kw => ing.includes(kw))) ||
        freshKeywords.some(kw => recipeName.includes(kw))) {
        return 'fresca_estiva';
    }

    // Classica (Classic - Margherita, Marinara)
    const classicKeywords = ['margherita', 'marinara'];
    const isSimple = ingredientNames.length <= 4;
    if (classicKeywords.some(kw => recipeName.includes(kw)) ||
        (isSimple && (ingredientNames.includes('mozzarella') || ingredientNames.includes('pomodoro')))) {
        return 'classica';
    }

    // Tradizionale (Traditional - Prosciutto, Funghi, Capricciosa)
    const traditionalKeywords = ['prosciutto', 'funghi', 'capricciosa', 'quattro stagioni', 'diavola', 'quattro formaggi'];
    if (traditionalKeywords.some(kw => recipeName.includes(kw)) ||
        ingredientNames.some(ing => ing.includes('prosciutto') || ing.includes('funghi champignon'))) {
        return 'tradizionale';
    }

    // Default: Tradizionale (most common)
    return 'tradizionale';
}

async function migrateRecipes() {
    try {
        let recipes;

        // Fetch all recipes
        if (isTurso) {
            const result = await db.execute('SELECT * FROM Recipes');
            recipes = result.rows;
        } else {
            const stmt = db.prepare('SELECT * FROM Recipes');
            recipes = stmt.all();
        }

        console.log(`📊 Found ${recipes.length} total recipes\n`);

        // Filter recipes that need migration (null recipeSource or archetypeUsed)
        const recipesToMigrate = recipes.filter(r => !r.recipeSource || !r.archetypeUsed);

        console.log(`🔍 ${recipesToMigrate.length} recipes need migration\n`);

        if (recipesToMigrate.length === 0) {
            console.log('✅ No recipes to migrate!');
            return;
        }

        let migrated = 0;
        const archetypeCount = {};

        for (const recipe of recipesToMigrate) {
            try {
                // Parse JSON fields
                const parsedRecipe = {
                    ...recipe,
                    baseIngredients: recipe.baseIngredients ?
                        (typeof recipe.baseIngredients === 'string' ?
                            JSON.parse(recipe.baseIngredients) : recipe.baseIngredients) : []
                };

                // Detect archetype
                const archetype = detectArchetype(parsedRecipe);

                // Count
                archetypeCount[archetype] = (archetypeCount[archetype] || 0) + 1;

                // Update recipe
                if (isTurso) {
                    await db.execute({
                        sql: 'UPDATE Recipes SET recipeSource = ?, archetypeUsed = ? WHERE id = ?',
                        args: ['manual', archetype, recipe.id]
                    });
                } else {
                    const stmt = db.prepare('UPDATE Recipes SET recipeSource = ?, archetypeUsed = ? WHERE id = ?');
                    stmt.run('manual', archetype, recipe.id);
                }

                migrated++;
                console.log(`✅ ${recipe.name} → ${archetype}`);

            } catch (err) {
                console.error(`❌ Error migrating recipe ${recipe.id}:`, err.message);
            }
        }

        console.log(`\n✅ Migration completed!`);
        console.log(`📊 Results:`);
        console.log(`   - Total migrated: ${migrated} recipes`);
        console.log(`   - Archetype distribution:`);
        Object.entries(archetypeCount).sort((a, b) => b[1] - a[1]).forEach(([arch, count]) => {
            console.log(`      • ${arch}: ${count} pizze`);
        });

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        throw error;
    }
}

migrateRecipes()
    .then(() => {
        console.log('\n🎉 Done!');
        if (!isTurso) {
            db.close();
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
