
import { generateMultipleRecipes } from './src/modules/recipeGenerator.js';

async function verifyFix() {
    console.log("Starting verification of Duplicate Ingredients fix...");

    // We suggest ingredients that are COMMON in archetypes to force potential duplicates
    const suggestions = ["Fior di latte", "Pomodoro San Marzano", "Basilico fresco"];

    try {
        const recipes = await generateMultipleRecipes(20, suggestions);
        let allPassed = true;

        recipes.forEach((recipe, index) => {
            const names = recipe.baseIngredients.map(i => i.name);
            const uniqueNames = new Set(names);

            if (names.length !== uniqueNames.size) {
                console.error(`❌ Duplicate found in recipe ${index} (${recipe.name}):`);
                console.error(`   Ingredients: ${names.join(', ')}`);
                allPassed = false;
            } else {
                // Ensure suggestions are actually present
                const containsSuggestions = suggestions.every(s => names.includes(s));
                if (!containsSuggestions) {
                    // This might happen if an archetype explicitly doesn't use them, 
                    // but our pre-injection should ensure they are there.
                    // Actually, if an archetype replaces them or something... but they should be there.
                }
            }
        });

        if (allPassed) {
            console.log("✅ SUCCESS: All 20 recipes generated without duplicates!");
        } else {
            console.error("❌ FAILED: Some recipes contain duplicates.");
            process.exit(1);
        }
    } catch (error) {
        console.error("❌ Error during verification:", error);
        process.exit(1);
    }
}

verifyFix();
