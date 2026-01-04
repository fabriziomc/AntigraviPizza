import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@libsql/client';

/**
 * Re-implementation of the dynamic description logic for the cleanup script
 */
function generateArchetypeDescription(archetype, ingredients, preparations, doughType) {
    const all = [...preparations, ...ingredients];
    const getNames = (count = 2) => all.filter(i => !['Fior di latte', 'Provola affumicata', 'Mozzarella', 'Pomodoro San Marzano'].includes(i.name)).map(i => i.name).slice(0, count);

    const names = getNames(3);
    const ingredientsStr = names.length > 1
        ? names.slice(0, -1).join(', ') + ' e ' + names.slice(-1)
        : names[0] || 'ingredienti selezionati';

    switch (archetype) {
        case 'dolce_salato':
            return `Un perfetto equilibrio tra sapidità e dolcezza con ${ingredientsStr.toLowerCase()}, su base ${doughType.toLowerCase()}.`;
        case 'terra_bosco':
            return `I profumi del bosco e della terra con ${ingredientsStr.toLowerCase()}, su una base rustica di tipo ${doughType.toLowerCase()}.`;
        case 'fresca_estiva':
            return `Freschezza assoluta con ${ingredientsStr.toLowerCase()} aggiunti a crudo su una ${doughType.toLowerCase()}.`;
        case 'piccante_decisa':
            return `Il carattere deciso e piccante di ${ingredientsStr.toLowerCase()} bilanciato con cura.`;
        case 'mare':
            return `I sapori del mare con ${ingredientsStr.toLowerCase()}, esaltati da aromi freschi su base ${doughType.toLowerCase()}.`;
        case 'vegana':
            return `Una pizza completamente vegetale con ${ingredientsStr.toLowerCase()}, ricca di sapori naturali.`;
        default:
            return `Un'interpretazione contemporanea con ${ingredientsStr.toLowerCase()} su impasto ${doughType.toLowerCase()}.`;
    }
}

async function cleanupDescriptions() {
    const db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    console.log('🚀 Starting description synchronization...');

    try {
        const result = await db.execute("SELECT * FROM Recipes");
        const recipes = result.rows;

        let fixedCount = 0;

        for (const recipe of recipes) {
            const base = JSON.parse(recipe.baseIngredients || '[]');
            const preps = JSON.parse(recipe.preparations || '[]');
            const dough = recipe.suggestedDough || 'Contemporanea';
            const archetype = recipe.archetypeUsed || 'classica';

            const newDesc = generateArchetypeDescription(archetype, base, preps, dough);

            // Only update if the old description was likely too long or inconsistent
            // We use a heuristic: if they are significantly different
            if (recipe.description !== newDesc) {
                // If the old description contains ingredients NOT in the list, we definitely update
                const allNames = [...base, ...preps].map(i => (i.name || '').toLowerCase());
                const oldDescLower = (recipe.description || '').toLowerCase();

                // Check if description has more than 5 ingredients mentioned or looks inconsistent
                let needsFix = false;

                if (allNames.length > 0) {
                    // If description is very long or has many commas
                    if ((oldDescLower.match(/,/g) || []).length > 3) needsFix = true;
                }

                // If it's an archetype recipe, we just align it to the new standard for consistency
                if (recipe.recipeSource === 'archetype') needsFix = true;

                if (needsFix) {
                    console.log(`📝 Updating description for: ${recipe.name}`);
                    await db.execute({
                        sql: "UPDATE Recipes SET description = ? WHERE id = ?",
                        args: [newDesc, recipe.id]
                    });
                    fixedCount++;
                }
            }
        }

        console.log(`\n✨ Done! Synchronized ${fixedCount} recipe descriptions.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during cleanup:', err);
        process.exit(1);
    }
}

cleanupDescriptions();
