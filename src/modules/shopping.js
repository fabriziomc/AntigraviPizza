// ============================================
// SHOPPING LIST MODULE
// ============================================

import { getRecipeById } from './database.js';
import { aggregateIngredients, groupByCategory, formatQuantity } from '../utils/helpers.js';

/**
 * Generate shopping list for a pizza night
 * @param {Array} selectedPizzas - Array of { recipeId, quantity }
 * @returns {Object} Grouped shopping list by category
 */
export async function generateShoppingList(selectedPizzas) {
    if (!selectedPizzas || selectedPizzas.length === 0) {
        return {};
    }

    // Fetch all recipes
    const recipes = await Promise.all(
        selectedPizzas.map(item => getRecipeById(item.recipeId))
    );

    // Get quantities
    const quantities = selectedPizzas.map(item => item.quantity);

    // Aggregate ingredients
    const aggregated = aggregateIngredients(recipes, quantities);

    // Group by category
    const grouped = groupByCategory(aggregated);

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
