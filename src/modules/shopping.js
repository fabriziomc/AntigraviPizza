// ============================================
// SHOPPING LIST MODULE
// ============================================

import { getRecipeById, getAllPreparations } from './database.js';
import { aggregateIngredients, groupByCategory, formatQuantity } from '../utils/helpers.js';
import { DOUGH_RECIPES } from '../utils/constants.js';

/**
 * Generate shopping list for a pizza night
 * @param {Array} selectedPizzas - Array of { recipeId, quantity }
 * @param {String} selectedDough - Type of dough selected for the night
 * @param {Array} availableIngredients - Array of ingredient names already available
 * @returns {Object} Grouped shopping list by category
 */
export async function generateShoppingList(selectedPizzas, selectedDough = null, availableIngredients = []) {
    if (!selectedPizzas || selectedPizzas.length === 0) {
        return {};
    }

    // Fetch all recipes
    const recipes = await Promise.all(
        selectedPizzas.map(item => getRecipeById(item.recipeId))
    );

    // Get quantities
    const quantities = selectedPizzas.map(item => item.quantity);

    // Aggregate ingredients from pizzas (toppings only)
    const aggregated = aggregateIngredients(recipes, quantities);

    // Fetch preparations from database
    const preparations = await getAllPreparations();

    // Add preparation ingredients
    recipes.forEach((recipe, index) => {
        const pizzaQuantity = quantities[index] || 1;

        if (recipe.preparations && recipe.preparations.length > 0) {
            recipe.preparations.forEach(prep => {
                // Find preparation data from database
                const prepData = preparations.find(p => p.id === prep.id);
                if (!prepData || !prepData.ingredients) return;

                // Calculate scaling factor
                // prep.quantity is how much we need (e.g., 100g)
                // prepData.ingredients[].perPortion is how much per portion
                // We need to scale based on how many portions we're making
                prepData.ingredients.forEach(ingredient => {
                    // Skip if ingredient doesn't have a name
                    if (!ingredient || !ingredient.name) {
                        console.warn('Skipping ingredient without name:', ingredient);
                        return;
                    }

                    // Calculate how much of this ingredient we need
                    // If prep.quantity is specified, use it to scale from perPortion
                    // Otherwise, assume we need 1 full yield worth
                    let scaledQuantity;
                    if (ingredient.perPortion && prep.quantity) {
                        // Scale based on quantity needed vs portion size
                        scaledQuantity = ingredient.perPortion * (prep.quantity / ingredient.perPortion) * pizzaQuantity;
                    } else {
                        // Fallback: use total quantity for the recipe yield
                        scaledQuantity = ingredient.quantity * pizzaQuantity;
                    }

                    // Find if ingredient already exists in aggregated list
                    const existingIndex = aggregated.findIndex(i => i.name.toLowerCase() === ingredient.name.toLowerCase());

                    if (existingIndex >= 0) {
                        // Ingredient already exists, add to it
                        aggregated[existingIndex].quantity += scaledQuantity;
                    } else {
                        // New ingredient, add it
                        aggregated.push({
                            name: ingredient.name,
                            quantity: scaledQuantity,
                            unit: ingredient.unit,
                            category: ingredient.category || 'Altro'
                        });
                    }
                });
            });
        }
    });

    // Add dough ingredients if selectedDough is provided
    if (selectedDough) {
        const doughRecipe = DOUGH_RECIPES.find(d => d.type === selectedDough);
        if (doughRecipe) {
            // Calculate total pizzas needed
            const totalPizzas = quantities.reduce((sum, qty) => sum + qty, 0);

            // Calculate how many batches of dough we need
            const batchesNeeded = Math.ceil(totalPizzas / doughRecipe.yield);

            // Add dough ingredients
            doughRecipe.ingredients.forEach(ingredient => {
                const existingIndex = aggregated.findIndex(i => i.name === ingredient.name);
                const totalQuantity = ingredient.quantity * batchesNeeded;

                if (existingIndex >= 0) {
                    // Ingredient already exists, add to it
                    aggregated[existingIndex].quantity += totalQuantity;
                } else {
                    // New ingredient, add it
                    aggregated.push({
                        name: ingredient.name,
                        quantity: totalQuantity,
                        unit: ingredient.unit,
                        category: ingredient.category || 'Impasto'
                    });
                }
            });
        }
    }

    // Filter out available ingredients (case-insensitive matching)
    const filtered = aggregated.filter(ingredient =>
        !availableIngredients.some(avail =>
            avail.toLowerCase() === ingredient.name.toLowerCase()
        )
    );

    // Group by category
    const grouped = groupByCategory(filtered);

    return grouped;
}

/**
 * Format shopping list for display
 */
export function formatShoppingList(groupedList) {
    const formatted = [];

    for (const [category, ingredients] of Object.entries(groupedList)) {
        formatted.push({
            category,
            items: ingredients.map(ing => ({
                name: ing.name,
                quantity: formatQuantity(ing.quantity, ing.unit),
                checked: false
            }))
        });
    }

    return formatted;
}

/**
 * Export shopping list as text
 */
export function exportShoppingListAsText(groupedList, pizzaNightName) {
    let text = `🍕 LISTA SPESA - ${pizzaNightName}\n`;
    text += `${'='.repeat(50)}\n\n`;

    for (const [category, ingredients] of Object.entries(groupedList)) {
        text += `📦 ${category.toUpperCase()}\n`;
        text += `${'-'.repeat(50)}\n`;

        ingredients.forEach(ing => {
            text += `☐ ${ing.name} - ${formatQuantity(ing.quantity, ing.unit)}\n`;
        });

        text += '\n';
    }

    text += `\nGenerato da AntigraviPizza 🚀\n`;

    return text;
}

/**
 * Download shopping list as text file
 */
export function downloadShoppingList(groupedList, pizzaNightName) {
    const text = exportShoppingListAsText(groupedList, pizzaNightName);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-spesa-${pizzaNightName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}
