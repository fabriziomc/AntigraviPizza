
import { DOUGH_TYPES } from './constants.js';

/**
 * Determines the dough type of a recipe, handling both new and legacy data.
 * @param {Object} recipe - The recipe object
 * @returns {string} - The dough type name
 */
export function getRecipeDoughType(recipe) {
    // 1. If explicit property exists, use it
    if (recipe.dough) return recipe.dough;

    // 2. Try to infer from instructions
    let instructionsText = '';

    if (Array.isArray(recipe.instructions)) {
        instructionsText = recipe.instructions.join(' ').toLowerCase();
    } else if (recipe.instructions && recipe.instructions.dough) {
        instructionsText = recipe.instructions.dough.join(' ').toLowerCase();
    }

    if (!instructionsText) return 'Sconosciuto';

    // 3. Match against known types
    for (const dough of DOUGH_TYPES) {
        if (instructionsText.includes(dough.type.toLowerCase())) {
            return dough.type;
        }
    }

    // 4. Fallback inference based on keywords
    if (instructionsText.includes('integrale')) return 'Integrale';
    if (instructionsText.includes('manitoba') || instructionsText.includes('alta idratazione')) return 'Alta Idratazione';
    if (instructionsText.includes('frigo') || instructionsText.includes('romana')) return 'Romana Croccante';
    if (instructionsText.includes('contemporanea') || instructionsText.includes('doppia lievitazione')) return 'Contemporanea';

    // Default
    return 'Napoletana Classica';
}
