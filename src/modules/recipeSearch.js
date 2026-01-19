// ============================================
// RECIPE SEARCH MODULE
// ============================================

import { addRecipe } from './database.js';
import { showToast } from '../utils/helpers.js';

/**
 * Parse recipe from URL or text input
 * This is a basic parser - in production, you'd use more sophisticated parsing
 */
export function parseRecipeInput(input) {
    // For now, this returns a template that users can fill
    // In the future, this could integrate with web scraping APIs
    return {
        name: '',
        pizzaiolo: '',
        source: input.startsWith('http') ? input : '',
        description: '',
        ingredients: [],
        instructions: [],
        imageUrl: '',
        tags: []
    };
}

/**
 * Import recipe manually
 */
export async function importRecipeManually(recipeData) {
    try {
        // Add source tracking for manual recipes
        const enrichedData = {
            ...recipeData,
            recipeSource: 'manual',
            archetypeUsed: null
        };

        const recipe = await addRecipe(enrichedData);
        showToast('Ricetta aggiunta con successo! 🍕', 'success');
        return recipe;
    } catch (error) {
        showToast('Errore nell\'aggiungere la ricetta', 'error');
        throw error;
    }
}

/**
 * Search web for pizza recipes (placeholder)
 * This would integrate with a search API in production
 */
export async function searchWebForRecipes(query) {
    // Placeholder for web search functionality
    // In production, this would call a search API like Google Custom Search

    showToast('Ricerca web non ancora implementata. Usa l\'importazione manuale.', 'info');

    return {
        results: [],
        message: 'Per implementare la ricerca web, è necessaria una API key per servizi come Google Custom Search API.'
    };
}

/**
 * Import sample recipes using the intelligent generator
 */
export async function importSampleRecipes() {
    // Get count from input field
    const countInput = document.getElementById('recipeCount');
    const numRecipes = countInput ? parseInt(countInput.value) : 3;

    // Validate input
    if (isNaN(numRecipes) || numRecipes < 1 || numRecipes > 20) {
        showToast('Inserisci un numero valido tra 1 e 20', 'error');
        return 0;
    }

    // Show loading message
    showToast(`Generazione di ${numRecipes} ricette gourmet in corso...`, 'info');

    // Get suggested ingredients from global window object (set by Discovery.js)
    const suggestedIngredients = window.autoSuggestedIngredients || [];

    // Import the recipe generator dynamically
    const { generateMultipleRecipes } = await import('./recipeGenerator.js');

    // Generate the requested number of recipes (with placeholder images)
    const newRecipes = await generateMultipleRecipes(numRecipes, suggestedIngredients);
    let imported = 0;
    let lastError = null;
    const importedRecipes = [];

    for (const recipe of newRecipes) {
        try {
            const addedRecipe = await addRecipe(recipe);
            imported++;

            // Track imported recipes with their IDs for background image generation
            // addRecipe returns the full recipe object, extract the ID
            if (recipe.imageGenerationPending && recipe.imageGenerationData) {
                importedRecipes.push({
                    id: addedRecipe.id,  // Extract ID from returned recipe object
                    ...recipe.imageGenerationData
                });
            }
        } catch (error) {
            console.error('Failed to import generated recipe:', recipe.name, error);
            lastError = error.message;
            if (error.message.includes('licenza free')) break;
        }
    }

    if (imported > 0) {
        showToast(`${imported} nuove ricette gourmet generate! 🍕`, 'success');

        // Generate images in background (parallel, non-blocking)
        if (importedRecipes.length > 0) {
            showToast(`Generazione immagini in corso...`, 'info');
            generateImagesInBackground(importedRecipes);
        }
    } else {
        const errorMsg = lastError || 'Nessuna ricetta generata';
        showToast(errorMsg, 'error');
    }

    return imported;
}

/**
 * Generate images for recipes in background (parallel)
 * @param {Array} recipes - Array of {id, pizzaName, mainIngredientNames, hasTomato}
 */
async function generateImagesInBackground(recipes) {
    console.log(`🎨 Starting background image generation for ${recipes.length} recipes...`);

    const { generatePizzaImage } = await import('../utils/imageProviders.js');
    const { updateRecipeImage } = await import('./database.js');

    let successCount = 0;
    let failCount = 0;

    // Generate all images in parallel with small delays to avoid rate limiting
    const imagePromises = recipes.map(async (recipe, index) => {
        // Add small delay between requests to avoid hitting rate limits (15 RPM for Gemini)
        // Delay: 0ms, 500ms, 1000ms, 1500ms, etc.
        await new Promise(resolve => setTimeout(resolve, index * 500));

        try {
            console.log(`🖼️ Generating image for: ${recipe.pizzaName}`);

            const result = await generatePizzaImage(
                recipe.pizzaName,
                recipe.mainIngredientNames,
                {
                    hasTomato: recipe.hasTomato,
                    seed: Date.now() + index
                }
            );

            // Update recipe image in database
            await updateRecipeImage(recipe.id, result.imageUrl);

            successCount++;
            console.log(`✅ Image generated for ${recipe.pizzaName} using ${result.provider}`);

            // Refresh UI to show the new image
            if (window.refreshData) {
                await window.refreshData();
            }

        } catch (error) {
            failCount++;
            console.error(`❌ Failed to generate image for ${recipe.pizzaName}:`, error.message);
            // Don't throw - let other images continue generating
        }
    });

    // Wait for all images to complete
    await Promise.all(imagePromises);

    console.log(`🎨 Background image generation complete: ${successCount} success, ${failCount} failed`);

    if (successCount > 0) {
        showToast(`${successCount} immagini generate! 🖼️`, 'success');
    }
}
