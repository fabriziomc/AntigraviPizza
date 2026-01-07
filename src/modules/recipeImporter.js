/**
 * Recipe Importer Module
 * Frontend module for importing recipes from text
 */

// Use relative API path since the frontend and backend are served from the same origin
const API_URL = '/api';

/**
 * Import recipe(s) from text
 * @param {string} recipeText - Text containing one or more recipes
 * @returns {Promise<Object>} Import result
 */
export async function importRecipeText(recipeText) {
    try {
        const response = await fetch(`${API_URL}/import-recipe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipeText })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Import failed');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error importing recipe:', error);
        throw error;
    }
}

/**
 * Upload and import recipe file
 * @param {File} file - Text file containing recipes
 * @returns {Promise<Object>} Import result
 */
export async function uploadRecipeFile(file) {
    try {
        // Read file content
        const text = await readFileAsText(file);

        // Import using text import
        return await importRecipeText(text);
    } catch (error) {
        console.error('Error uploading recipe file:', error);
        throw error;
    }
}

/**
 * Read file as text
 * @param {File} file - File to read
 * @returns {Promise<string>} File content as text
 */
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result);
        };

        reader.onerror = (e) => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
}

/**
 * Format import result for display
 * @param {Object} result - Import result from API
 * @returns {Object} Formatted result for UI
 */
export function formatImportResult(result) {
    const summary = [];

    if (result.imported > 0) {
        summary.push(`✅ ${result.imported} ricetta/e importata/e con successo`);
    }

    if (result.createdIngredients > 0) {
        summary.push(`🥕 ${result.createdIngredients} nuovo/i ingrediente/i creato/i`);
    }

    if (result.createdPreparations > 0) {
        summary.push(`👨‍🍳 ${result.createdPreparations} nuova/e preparazione/i creata/e`);
    }

    if (result.failed > 0) {
        summary.push(`❌ ${result.failed} ricetta/e fallita/e`);
    }

    return {
        success: result.success,
        summary: summary.join('\n'),
        recipes: result.recipes || [],
        errors: result.errors || []
    };
}
