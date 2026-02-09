// ============================================
// SHOPPING LIST MODULE
// ============================================

import { getRecipeById, getAllPreparations, getAllIngredients, getAllCategories } from './database.js';
import { aggregateIngredients, groupByCategory, formatQuantity } from '../utils/helpers.js';
import { DOUGH_RECIPES } from '../utils/constants.js';

/**
 * Generate shopping list for a pizza night
 * @param {Array} selectedPizzas - Array of { recipeId, quantity }
 * @param {String} selectedDough - Type of dough selected for the night
 * @param {Array} availableIngredients - Array of ingredient names already available
 * @param {Object|Map} cachedRecipes - Optional map/object of pre-fetched recipes {id: recipe}
 * @returns {Object} Grouped shopping list by category
 */
export async function generateShoppingList(selectedPizzas, selectedDough = null, availableIngredients = [], cachedRecipes = null) {
    if (!selectedPizzas || selectedPizzas.length === 0) {
        return {};
    }

    // Load all ingredients and categories upfront for resolution
    const allIngredients = await getAllIngredients();
    const allCategories = await getAllCategories();

    // Create lookup maps
    const ingredientMap = {};
    const ingredientNameMap = {}; // New map for name-based lookup

    allIngredients.forEach(ing => {
        ingredientMap[ing.id] = ing;
        if (ing.name) {
            ingredientNameMap[ing.name.toLowerCase()] = ing;
        }
    });

    const categoryMap = {};
    allCategories.forEach(cat => {
        categoryMap[cat.id] = cat.name;
    });

    // Helper to resolve ingredient with multiple fallback strategies
    const resolveIngredient = (ing) => {
        // Preserve all original fields including perPortion, quantity, unit
        const preservedFields = {
            quantity: ing.quantity,
            unit: ing.unit,
            perPortion: ing.perPortion
        };
        
        // Try to resolve by ingredientId first
        if (ing.ingredientId && ingredientMap[ing.ingredientId]) {
            const resolved = ingredientMap[ing.ingredientId];
            return {
                ...ing,
                ...preservedFields,
                name: resolved.name,
                category: categoryMap[resolved.categoryId] || 'Altro',
                categoryId: resolved.categoryId
            };
        }
        
        // Try to resolve by id (some preparations might use id instead of ingredientId)
        if (ing.id && ingredientMap[ing.id]) {
            const resolved = ingredientMap[ing.id];
            return {
                ...ing,
                ...preservedFields,
                name: resolved.name,
                category: categoryMap[resolved.categoryId] || 'Altro',
                categoryId: resolved.categoryId
            };
        }
        
        // Try to resolve by name using ingredientNameMap
        if (ing.name && ingredientNameMap[ing.name.toLowerCase()]) {
            const resolved = ingredientNameMap[ing.name.toLowerCase()];
            return {
                ...ing,
                ...preservedFields,
                name: resolved.name,
                category: categoryMap[resolved.categoryId] || 'Altro',
                categoryId: resolved.categoryId
            };
        }
        
        // If ingredient already has a name but no ID mapping, use the category if provided
        if (ing.name) {
            return {
                ...ing,
                ...preservedFields,
                category: ing.category || 'Altro'
            };
        }
        
        // Final fallback: return as-is
        console.warn('Could not resolve ingredient:', ing);
        return ing;
    };

    // Fetch all recipes (or use cache)
    const recipes = await Promise.all(
        selectedPizzas.map(async (item) => {
            // Check cache first
            if (cachedRecipes) {
                // Handle both Map and Object
                if (cachedRecipes instanceof Map && cachedRecipes.has(item.recipeId)) {
                    return cachedRecipes.get(item.recipeId);
                } else if (cachedRecipes[item.recipeId]) {
                    return cachedRecipes[item.recipeId];
                } else if (Array.isArray(cachedRecipes)) {
                    const found = cachedRecipes.find(r => r.id === item.recipeId);
                    if (found) return found;
                }
            }
            // Fallback to fetch
            return await getRecipeById(item.recipeId);
        })
    );

    // Get quantities
    const quantities = selectedPizzas.map(item => item.quantity);

    // Track which pizzas use which ingredients (by ingredient name)
    const ingredientPizzaMap = new Map(); // Map<ingredientName, Set<pizzaIndex>>

    // Aggregate ingredients from pizzas (toppings only) - pass maps for category resolution
    const aggregated = aggregateIngredients(recipes, quantities, ingredientMap, categoryMap, ingredientNameMap);

    // Track pizza usage for base ingredients
    recipes.forEach((recipe, index) => {
        const rawIngredients = [
            ...(recipe.baseIngredients || []),
            ...(recipe.toppingsDuringBake || []),
            ...(recipe.toppingsPostBake || []),
            ...(recipe.ingredients || [])
        ];

        rawIngredients.forEach(ing => {
            if (!ing || !ing.name) return;
            const key = ing.name.toLowerCase();
            if (!ingredientPizzaMap.has(key)) {
                ingredientPizzaMap.set(key, new Set());
            }
            ingredientPizzaMap.get(key).add(index);
        });
    });

    // Fetch preparations from database
    const preparations = await getAllPreparations();

    // Add preparation ingredients
    recipes.forEach((recipe, index) => {
        const pizzaQuantity = quantities[index] || 1;

        if (recipe.preparations && recipe.preparations.length > 0) {
            recipe.preparations.forEach(prep => {
                // Find preparation data from database
                const prepData = preparations.find(p => p.id === prep.id);
                if (!prepData || !prepData.ingredients || !Array.isArray(prepData.ingredients) || prepData.ingredients.length === 0) {
                    return;
                }

                prepData.ingredients.forEach(ingredient => {
                    // Resolve ingredient
                    const ingredientData = resolveIngredient(ingredient);

                    // Skip if ingredient doesn't have a name
                    if (!ingredientData || !ingredientData.name) {
                        console.warn('Skipping ingredient without name:', ingredient);
                        return;
                    }

                    // Track pizza usage
                    const key = ingredientData.name.toLowerCase();
                    if (!ingredientPizzaMap.has(key)) {
                        ingredientPizzaMap.set(key, new Set());
                    }
                    ingredientPizzaMap.get(key).add(index);

                    // Calculate how much of this ingredient we need
                    let scaledQuantity;
                    
                    // Get yield with default value of 4 if not specified
                    const yieldValue = prepData.yield || 4;
                    
                    // Check if we have the necessary data
                    if (!ingredientData.quantity || !prep.quantity) {
                        console.warn('Missing quantity data for preparation ingredient:', {
                            ingredient: ingredientData.name,
                            ingredientQuantity: ingredientData.quantity,
                            prepQuantity: prep.quantity
                        });
                        return;
                    }
                    
                    // Try to calculate using perPortion if available
                    if (ingredientData.perPortion) {
                        // ingredientData.perPortion is the amount per portion (e.g., 125g per portion)
                        // yieldValue is number of portions (e.g., 4)
                        // Total preparation weight = ingredientData.perPortion * yieldValue
                        const totalPrepWeight = ingredientData.perPortion * yieldValue;
                        if (totalPrepWeight > 0) {
                            // Scaling factor = how much of the preparation is needed / total preparation weight
                            const scalingFactor = prep.quantity / totalPrepWeight;
                            scaledQuantity = ingredientData.quantity * scalingFactor * pizzaQuantity;
                        } else {
                            // Fallback: assume prep.quantity is the portion count
                            scaledQuantity = ingredientData.quantity * (prep.quantity / yieldValue) * pizzaQuantity;
                        }
                    } else {
                        // No perPortion, we need to estimate
                        // If we have yield, we can assume prep.quantity is in grams and represents
                        // a fraction of the total preparation
                        // Estimate total preparation weight as ingredientData.quantity * some factor
                        // This is a rough estimate - better to have perPortion data
                        const estimatedTotalPrepWeight = ingredientData.quantity * 2; // Rough estimate
                        if (estimatedTotalPrepWeight > 0) {
                            const scalingFactor = prep.quantity / estimatedTotalPrepWeight;
                            scaledQuantity = ingredientData.quantity * scalingFactor * pizzaQuantity;
                        } else {
                            // Last resort: assume ingredientData.quantity is for one portion
                            scaledQuantity = ingredientData.quantity * (prep.quantity / 100) * pizzaQuantity;
                        }
                    }
                    
                    // Ensure scaledQuantity is a valid number
                    if (isNaN(scaledQuantity) || scaledQuantity <= 0) {
                        console.warn('Invalid scaled quantity for ingredient:', ingredientData.name, scaledQuantity);
                        // Fallback to a reasonable default
                        scaledQuantity = ingredientData.quantity * pizzaQuantity;
                    }

                    // Find if ingredient already exists in aggregated list
                    const existingIndex = aggregated.findIndex(i => i.name.toLowerCase() === ingredientData.name.toLowerCase());

                    if (existingIndex >= 0) {
                        // Ingredient already exists, add to it
                        aggregated[existingIndex].quantity += scaledQuantity;
                    } else {
                        // New ingredient, add it
                        aggregated.push({
                            name: ingredientData.name,
                            quantity: scaledQuantity,
                            unit: ingredientData.unit,
                            category: ingredientData.category || 'Altro'
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

            // Add dough ingredients (they're used in ALL pizzas)
            doughRecipe.ingredients.forEach(ingredient => {
                const key = ingredient.name.toLowerCase();
                // Dough is used in all pizzas
                if (!ingredientPizzaMap.has(key)) {
                    ingredientPizzaMap.set(key, new Set());
                }
                recipes.forEach((_, idx) => ingredientPizzaMap.get(key).add(idx));

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

    // Add pizzaCount to each ingredient
    aggregated.forEach(ingredient => {
        const key = ingredient.name.toLowerCase();
        ingredient.pizzaCount = ingredientPizzaMap.has(key) ? ingredientPizzaMap.get(key).size : 0;
    });

    // Filter out available ingredients (case-insensitive matching)
    const filtered = aggregated.filter(ingredient =>
        !availableIngredients.some(avail =>
            avail.toLowerCase() === ingredient.name.toLowerCase()
        )
    );

    // Group by category, respecting displayOrder
    const categoryOrder = allCategories
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        .map(c => c.name);

    // Ensure "Impasto" is in the order if not already (it might be a virtual category)
    if (!categoryOrder.includes('Impasto')) {
        categoryOrder.unshift('Impasto'); // Usually first
    }
    // Ensure "Altro" is last if not already
    if (!categoryOrder.includes('Altro')) {
        categoryOrder.push('Altro');
    }

    const grouped = groupByCategory(filtered, categoryOrder);

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
    let text = `LISTA SPESA - ${pizzaNightName}\n`;
    text += `${'='.repeat(50)}\n\n`;

    for (const [category, ingredients] of Object.entries(groupedList)) {
        text += `${category.toUpperCase()}\n`;
        text += `${'-'.repeat(50)}\n`;

        ingredients.forEach(ing => {
            const pizzaCountText = ing.pizzaCount ? ` (${ing.pizzaCount} pizze)` : '';
            text += `[ ] ${ing.name} - ${formatQuantity(ing.quantity, ing.unit)}${pizzaCountText}\n`;
        });

        text += '\n';
    }

    text += `\nGenerato da AntigraviPizza\n`;

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
