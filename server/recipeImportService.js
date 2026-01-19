/**
 * Recipe Import Service
 * Handles the business logic for importing recipes into the database
 */

import { suggestIngredientCategory, validateRecipeData } from './recipeParser.js';

/**
 * Import a complete recipe into the database
 * @param {Object} parsedRecipe - Parsed recipe object from recipeParser
 * @param {DatabaseAdapter} dbAdapter - Database adapter instance
 * @returns {Promise<Object>} Import result with created entities
 */
export async function importRecipe(parsedRecipe, dbAdapter) {
    // Validate recipe data
    const validation = validateRecipeData(parsedRecipe);
    if (!validation.valid) {
        throw new Error(`Validazione fallita: ${validation.errors.join(', ')}`);
    }

    const result = {
        success: false,
        recipe: null,
        created: {
            ingredients: [],
            preparations: []
        },
        warnings: []
    };

    try {
        // Collect all ingredients from all sections
        const allIngredients = [
            ...(parsedRecipe.ingredientiCottura || []),
            ...(parsedRecipe.ingredientiPostCottura || [])
        ];

        // Process each ingredient
        const processedIngredients = [];
        for (const ingredient of allIngredients) {
            const processed = await findOrCreateIngredient(ingredient, dbAdapter);
            processedIngredients.push(processed);

            if (processed.created) {
                result.created.ingredients.push(processed.ingredient);
            }
        }

        // Build recipe object for database
        const recipeData = buildRecipeData(parsedRecipe, processedIngredients);

        // Create the recipe
        const createdRecipe = await dbAdapter.createRecipe(recipeData);
        result.recipe = createdRecipe;
        result.success = true;

        console.log(`✅ Recipe imported: ${createdRecipe.name}`);
        console.log(`   - Created ${result.created.ingredients.length} new ingredients`);

    } catch (error) {
        console.error('❌ Error importing recipe:', error);
        throw error;
    }

    return result;
}

/**
 * Find existing ingredient or create new one
 * @param {Object} ingredientData - Ingredient data from parser
 * @param {DatabaseAdapter} dbAdapter - Database adapter
 * @returns {Promise<Object>} Result with ingredient and created flag
 */
async function findOrCreateIngredient(ingredientData, dbAdapter) {
    const result = {
        ingredient: null,
        created: false
    };

    // Try to find existing ingredient
    const existing = await findIngredientByName(ingredientData.name, dbAdapter);

    if (existing) {
        result.ingredient = existing;
        console.log(`   ✓ Found existing ingredient: ${existing.name}`);
        return result;
    }

    // Ingredient doesn't exist, create it
    console.log(`   + Creating new ingredient: ${ingredientData.name}`);

    // Get all categories to find the right one
    const categories = await dbAdapter.getAllCategories();
    const suggestedCategoryName = suggestIngredientCategory(ingredientData.name);

    // Find category by name
    let category = categories.find(c =>
        c.name.toLowerCase() === suggestedCategoryName.toLowerCase()
    );

    // If category not found, use "Altro" as fallback
    if (!category) {
        category = categories.find(c => c.name.toLowerCase() === 'altro');
    }

    if (!category) {
        throw new Error(`Categoria non trovata per ingrediente: ${ingredientData.name}`);
    }

    // Create new ingredient
    const newIngredient = {
        id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: ingredientData.originalName || ingredientData.name,
        categoryId: category.id,
        subcategory: null,
        minWeight: ingredientData.quantity || 50,
        maxWeight: ingredientData.quantity ? ingredientData.quantity * 1.5 : 150,
        defaultUnit: ingredientData.unit || 'g',
        postBake: 0, // Will be set based on recipe section
        phase: 'topping',
        season: null,
        allergens: JSON.stringify(guessAllergens(ingredientData.name)),
        tags: JSON.stringify(guessTags(ingredientData.name)),
        isCustom: 1,
        dateAdded: Date.now()
    };

    const created = await dbAdapter.createIngredient(newIngredient);
    result.ingredient = created;
    result.created = true;

    return result;
}

/**
 * Find ingredient by name with fuzzy matching
 * @param {string} name - Ingredient name to search
 * @param {DatabaseAdapter} dbAdapter - Database adapter
 * @returns {Promise<Object|null>} Found ingredient or null
 */
async function findIngredientByName(name, dbAdapter) {
    const allIngredients = await dbAdapter.getAllIngredients();
    const normalizedSearch = name.toLowerCase().trim();

    // Try exact match first
    let found = allIngredients.find(ing =>
        ing.name.toLowerCase().trim() === normalizedSearch
    );

    if (found) return found;

    // Try partial match (ingredient name contains search or vice versa)
    found = allIngredients.find(ing => {
        const ingName = ing.name.toLowerCase().trim();
        return ingName.includes(normalizedSearch) || normalizedSearch.includes(ingName);
    });

    if (found) {
        console.log(`   ~ Fuzzy match: "${name}" -> "${found.name}"`);
        return found;
    }

    // Try word-by-word match - but require at least 2 matching words
    // or 1 very specific word (>5 chars) to avoid false positives
    const searchWords = normalizedSearch.split(/\s+/).filter(w => w.length > 3);
    found = allIngredients.find(ing => {
        const ingWords = ing.name.toLowerCase().trim().split(/\s+/).filter(w => w.length > 3);
        const matchingWords = searchWords.filter(sw =>
            ingWords.some(iw => iw === sw)
        );

        // Require at least 2 matching words, or 1 word that's very specific (>5 chars)
        return matchingWords.length >= 2 ||
            (matchingWords.length === 1 && matchingWords[0].length > 5);
    });

    if (found) {
        console.log(`   ~ Word match: "${name}" -> "${found.name}"`);
        return found;
    }

    return null;
}

/**
 * Build complete recipe data object for database
 * @param {Object} parsedRecipe - Parsed recipe from parser
 * @param {Array} processedIngredients - Processed ingredients with DB references
 * @returns {Object} Recipe data ready for database
 */
function buildRecipeData(parsedRecipe, processedIngredients) {
    // Map ALL ingredients (base + during bake + post bake) to baseIngredients format
    // This ensures all ingredients appear in the recipe card
    const allIngredients = processedIngredients.map(pi => ({
        id: pi.ingredient.id,
        name: pi.ingredient.name,
        // Use ingredient's minWeight if available, otherwise default to 50
        quantity: pi.ingredient.minWeight || 50,
        unit: pi.ingredient.defaultUnit || 'g',
        // Mark post-bake ingredients
        postBake: (parsedRecipe.ingredientiPostCottura || []).some(t =>
            t.name.toLowerCase() === pi.ingredient.name.toLowerCase()
        ) ? 1 : 0
    }));

    // NOTE: Do NOT use JSON.stringify here - the db-adapter will handle it
    // Passing already-stringified data causes double-stringify bug
    return {
        id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: parsedRecipe.name,
        description: parsedRecipe.description || '',
        pizzaiolo: 'Import',
        source: 'Imported Recipe',
        baseIngredients: allIngredients,  // Include ALL ingredients
        preparations: [],  // Pass as array, not JSON string
        instructions: parsedRecipe.instructions,  // Pass as array, not JSON string
        imageUrl: '', // Will be generated later
        dough: parsedRecipe.dough || 'nero',
        suggestedDough: parsedRecipe.dough || 'nero',
        archetype: parsedRecipe.archetype || 'fusion',  // Use 'fusion' for creative imported recipes
        recipeSource: 'manual',  // Mark as manually imported
        archetypeUsed: parsedRecipe.archetype || 'fusion',  // For UI display
        createdAt: Date.now(),
        dateAdded: Date.now(),
        isFavorite: 0,
        rating: 0,
        tags: parsedRecipe.tags || ['Gourmet', 'import']  // Pass as array, not JSON string
    };
}

/**
 * Guess allergens for an ingredient based on its name
 * @param {string} name - Ingredient name
 * @returns {Array} Array of allergen strings
 */
function guessAllergens(name) {
    const allergens = [];
    const lowerName = name.toLowerCase();

    if (lowerName.match(/mozzarella|burrata|latte|formaggio|pecorino|parmigiano|caprino|provola|scamorza/i)) {
        allergens.push('lattosio');
    }
    if (lowerName.match(/nocciola|noce|pistacchio|mandorla|arachid/i)) {
        allergens.push('frutta_secca');
    }
    if (lowerName.match(/glutine|farina|pane|pasta/i)) {
        allergens.push('glutine');
    }

    return allergens;
}

/**
 * Guess tags for an ingredient based on its name
 * @param {string} name - Ingredient name
 * @returns {Array} Array of tag strings
 */
function guessTags(name) {
    const tags = [];
    const lowerName = name.toLowerCase();

    // Check for vegetarian/vegan
    const meatKeywords = /guanciale|pancetta|speck|prosciutto|salame|mortadella|'nduja|nduja|salsiccia|carne/i;
    const animalKeywords = /mozzarella|burrata|latte|formaggio|pecorino|parmigiano|uova|miele/i;

    if (!meatKeywords.test(lowerName) && !animalKeywords.test(lowerName)) {
        tags.push('vegano');
        tags.push('vegetariano');
    } else if (!meatKeywords.test(lowerName)) {
        tags.push('vegetariano');
    }

    // Check for premium ingredients
    if (lowerName.match(/DOP|IGP|tartufo|bufala|bronte|spilinga/i)) {
        tags.push('premium');
    }

    // Check for spicy
    if (lowerName.match(/peperoncino|'nduja|nduja|piccante/i)) {
        tags.push('piccante');
    }

    return tags;
}

/**
 * Import multiple recipes from parsed data
 * @param {Array} parsedRecipes - Array of parsed recipes
 * @param {DatabaseAdapter} dbAdapter - Database adapter
 * @returns {Promise<Object>} Batch import result
 */
export async function importMultipleRecipes(parsedRecipes, dbAdapter) {
    const results = {
        success: [],
        failed: [],
        totalCreatedIngredients: 0,
        totalCreatedPreparations: 0
    };

    for (const parsedRecipe of parsedRecipes) {
        try {
            const result = await importRecipe(parsedRecipe, dbAdapter);
            results.success.push(result);
            results.totalCreatedIngredients += result.created.ingredients.length;
            results.totalCreatedPreparations += result.created.preparations.length;
        } catch (error) {
            results.failed.push({
                recipe: parsedRecipe.name || 'Unknown',
                error: error.message
            });
        }
    }

    return results;
}
