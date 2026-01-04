import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@libsql/client';

async function checkDescriptions() {
    const db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    try {
        const result = await db.execute("SELECT id, name, description, baseIngredients, preparations FROM Recipes");
        const recipes = result.rows;

        let inconsistentCount = 0;

        for (const recipe of recipes) {
            const base = JSON.parse(recipe.baseIngredients || '[]');
            const preps = JSON.parse(recipe.preparations || '[]');
            const allIngs = [...base, ...preps].map(i => (i.name || i.id || '').toLowerCase());

            const desc = (recipe.description || '').toLowerCase();

            // This is a rough check: see if words in the description look like ingredient names that aren't in the list
            // We'll focus on the case where the description mentions "con X, Y e Z"
            const match = desc.match(/con (.*?),? creata/i) || desc.match(/con (.*?) su una base/i) || desc.match(/con (.*?) e (.*?) aggiunti/i);

            if (match) {
                // Simplified check: if the description mentions an ingredient keyword that isn't in the list
                // For example, if desc contains "bietole" but allIngs doesn't.

                // We'll just print recipes for manual inspection of the logic
                // Especially those where ingredients list is exactly 5
                if (allIngs.length <= 5) {
                    // console.log(`Checking ${recipe.name}...`);
                }
            }

            // Better check: Let's just find recipes where ingredients count is exactly 5 
            // and see if description has more items.
            if (allIngs.length === 5) {
                // If the description has more than 5 commas or " e " it might be too long
                const commas = (desc.match(/,/g) || []).length;
                const ands = (desc.match(/ e /g) || []).length;
                if (commas + ands > 4) {
                    console.log(`⚠️ Potential inconsistent: ${recipe.name}`);
                    console.log(`   Desc: ${recipe.description}`);
                    console.log(`   List: ${allIngs.join(', ')}`);
                    inconsistentCount++;
                }
            }
        }

        console.log(`\nFound ${inconsistentCount} potentially inconsistent recipes.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDescriptions();
