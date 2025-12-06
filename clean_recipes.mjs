import fs from 'fs';

// Read the seed data
const data = JSON.parse(fs.readFileSync('public/seed-data.json', 'utf-8'));

// Mapping from flour type to suggested dough
const flourToDough = {
    'Farina tipo 00': 'Napoletana Classica',
    'Farina Manitoba': 'Alta Idratazione',
    'Farina integrale': 'Integrale',
    'Mix farina 00 e integrale': 'Contemporanea',
    'Farina tipo 0': 'Romana Croccante',
    'Farina tipo 1': 'Contemporanea'
};

function getSuggestedDough(ingredients) {
    // Determine suggested dough based on flour type in ingredients
    for (const ing of ingredients) {
        if (ing.category === 'Impasto') {
            const flourName = ing.name || '';
            // Check for exact matches first
            if (flourToDough[flourName]) {
                return flourToDough[flourName];
            }
            // Check for partial matches
            for (const [flourKey, doughType] of Object.entries(flourToDough)) {
                if (flourName.toLowerCase().includes(flourKey.toLowerCase())) {
                    return doughType;
                }
            }
        }
    }
    // Default to Napoletana Classica if no match found
    return 'Napoletana Classica';
}

// Process each recipe
const cleanedRecipes = data.recipes.map(recipe => {
    // Get suggested dough before removing ingredients
    const suggestedDough = getSuggestedDough(recipe.ingredients || []);

    // Remove dough ingredients (category: "Impasto")
    const cleanedIngredients = (recipe.ingredients || []).filter(
        ing => ing.category !== 'Impasto'
    );

    // Remove dough instructions
    const instructions = recipe.instructions || {};
    const cleanedInstructions = typeof instructions === 'object'
        ? { topping: instructions.topping || [] }
        : instructions;

    // Create cleaned recipe
    return {
        ...recipe,
        suggestedDough,
        ingredients: cleanedIngredients,
        instructions: cleanedInstructions
    };
});

// Create cleaned data
const cleanedData = {
    version: data.version || 2,
    exportDate: data.exportDate,
    recipes: cleanedRecipes
};

// Write cleaned data
fs.writeFileSync('public/seed-data.json', JSON.stringify(cleanedData, null, 2), 'utf-8');

console.log(`✅ Cleaned ${cleanedRecipes.length} recipes`);
console.log(`✅ Removed dough ingredients and instructions`);
console.log(`✅ Added suggestedDough field to all recipes`);
