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

    // Generate the requested number of recipes
    const newRecipes = await generateMultipleRecipes(numRecipes, suggestedIngredients);
    let imported = 0;

    for (const recipe of newRecipes) {
        try {
            await addRecipe(recipe);
            imported++;
        } catch (error) {
            console.error('Failed to import generated recipe:', recipe.name, error);
        }
    }

    if (imported > 0) {
        showToast(`${imported} nuove ricette gourmet generate! 🍕`, 'success');
    } else {
        showToast('Nessuna ricetta generata', 'error');
    }

    return imported;
}
