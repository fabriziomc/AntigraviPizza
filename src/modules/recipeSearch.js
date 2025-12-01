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
        const recipe = await addRecipe(recipeData);
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
    // Import the recipe generator dynamically
    const { generateMultipleRecipes } = await import('./recipeGenerator.js');

    // Generate 3 new random recipes
    const newRecipes = generateMultipleRecipes(3);
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
    }

    return imported;
}
