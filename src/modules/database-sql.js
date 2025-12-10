// ============================================
// DATABASE MODULE - SQL Server Operations
// ============================================

import { generateUUID } from '../utils/helpers.js';

// Use relative URL so it works both locally (with proxy) and in production
const API_URL = '/api';

/**
 * Initialize Database (No-op for SQL as connection is per request)
 */
export async function initDB() {
    console.log('SQL Adapter initialized');
    return true;
}

/**
 * Initialize seed data (No-op for SQL, handled manually or via script)
 */
export async function initSeedData() {
    // Could implement a check to /api/recipes to see if empty and then post seed data
    return;
}

export function getDB() {
    return null; // Not used in SQL mode
}

// ============================================
// RECIPE OPERATIONS
// ============================================

export async function addRecipe(recipeData) {
    const recipe = {
        id: generateUUID(),
        name: recipeData.name,
        pizzaiolo: recipeData.pizzaiolo || 'Sconosciuto',
        source: recipeData.source || '',
        description: recipeData.description || '',
        baseIngredients: recipeData.baseIngredients || [],
        preparations: recipeData.preparations || [],
        instructions: recipeData.instructions || [],
        imageUrl: recipeData.imageUrl || '',
        dough: recipeData.dough || '',
        suggestedDough: recipeData.suggestedDough || '',
        tags: recipeData.tags || [],
        dateAdded: Date.now(),
        isFavorite: false,
        archetype: recipeData.archetype || ''
    };

    const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe)
    });

    if (!response.ok) throw new Error('Failed to add recipe');
    return await response.json();
}

export async function getAllRecipes() {
    const response = await fetch(`${API_URL}/recipes`);
    if (!response.ok) throw new Error('Failed to fetch recipes');
    return await response.json();
}

export async function getRecipeById(id) {
    const response = await fetch(`${API_URL}/recipes/${id}`);
    if (!response.ok) throw new Error('Failed to fetch recipe');
    return await response.json();
}

export async function updateRecipe(id, updates) {
    const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update recipe');
    return await response.json();
}

export async function deleteRecipe(id) {
    const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete recipe');
    return true;
}

export async function toggleFavorite(id) {
    const recipe = await getRecipeById(id);
    return updateRecipe(id, { isFavorite: !recipe.isFavorite });
}

export async function getFavoriteRecipes() {
    const recipes = await getAllRecipes();
    return recipes.filter(r => r.isFavorite);
}

export async function searchRecipes(searchTerm) {
    const recipes = await getAllRecipes();
    const term = searchTerm.toLowerCase();
    return recipes.filter(recipe => {
        return recipe.name.toLowerCase().includes(term) ||
            (recipe.pizzaiolo && recipe.pizzaiolo.toLowerCase().includes(term)) ||
            (recipe.description && recipe.description.toLowerCase().includes(term)) ||
            (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(term)));
    });
}

export async function getRecipesByTag(tag) {
    const recipes = await getAllRecipes();
    return recipes.filter(r => r.tags.includes(tag));
}

// ============================================
// PIZZA NIGHT OPERATIONS
// ============================================

export async function createPizzaNight(nightData) {
    const pizzaNight = {
        id: generateUUID(),
        name: nightData.name,
        date: nightData.date || Date.now(),
        guestCount: nightData.guestCount || 6,
        selectedPizzas: nightData.selectedPizzas || [],
        selectedGuests: nightData.selectedGuests || [],
        notes: nightData.notes || '',
        status: 'planned',
        createdAt: Date.now()
    };

    const response = await fetch(`${API_URL}/pizza-nights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pizzaNight)
    });
    if (!response.ok) throw new Error('Failed to create pizza night');
    return await response.json();
}

export async function getAllPizzaNights() {
    const response = await fetch(`${API_URL}/pizza-nights`);
    if (!response.ok) throw new Error('Failed to fetch pizza nights');
    return await response.json();
}

export async function getPizzaNightById(id) {
    // Since we don't have a specific endpoint for single night in routes yet, filter from all
    // Or better, assume we added it or will add it.
    // For now, let's just fetch all and find.
    const nights = await getAllPizzaNights();
    return nights.find(n => n.id === id);
}

export async function updatePizzaNight(id, updates) {
    const response = await fetch(`${API_URL}/pizza-nights/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update pizza night');
    return await response.json();
}

export async function deletePizzaNight(id) {
    const response = await fetch(`${API_URL}/pizza-nights/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete pizza night');
    return true;
}

export async function completePizzaNight(id) {
    return updatePizzaNight(id, { status: 'completed' });
}

export async function getUpcomingPizzaNights() {
    const allNights = await getAllPizzaNights();
    const now = Date.now();
    return allNights
        .filter(night => night.date >= now && night.status === 'planned')
        .sort((a, b) => a.date - b.date);
}

// ============================================
// GUEST OPERATIONS
// ============================================

export async function addGuest(guestData) {
    const guest = {
        id: generateUUID(),
        name: guestData.name,
        createdAt: Date.now()
    };
    const response = await fetch(`${API_URL}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guest)
    });
    if (!response.ok) throw new Error('Failed to add guest');
    return await response.json();
}

export async function getAllGuests() {
    const response = await fetch(`${API_URL}/guests`);
    if (!response.ok) throw new Error('Failed to fetch guests');
    return await response.json();
}

export async function deleteGuest(id) {
    const response = await fetch(`${API_URL}/guests/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete guest');
    return true;
}

// ============================================
// COMBINATION OPERATIONS
// ============================================

export async function addCombination(ingredients) {
    const combination = {
        id: generateUUID(),
        ingredients: ingredients,
        createdAt: Date.now()
    };
    const response = await fetch(`${API_URL}/combinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(combination)
    });
    if (!response.ok) throw new Error('Failed to add combination');
    return await response.json();
}

export async function getAllCombinations() {
    const response = await fetch(`${API_URL}/combinations`);
    if (!response.ok) throw new Error('Failed to fetch combinations');
    return await response.json();
}

export async function deleteCombination(id) {
    const response = await fetch(`${API_URL}/combinations/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete combination');
    return true;
}

export async function initCombinations(defaultCombinations) {
    const existing = await getAllCombinations();
    if (existing.length === 0) {
        for (const combo of defaultCombinations) {
            await addCombination(combo);
        }
    }
}

// ============================================
// DATA EXPORT/IMPORT
// ============================================

export async function exportData() {
    const recipes = await getAllRecipes();
    const pizzaNights = await getAllPizzaNights();
    return {
        version: 1,
        exportDate: Date.now(),
        recipes,
        pizzaNights
    };
}

export async function importData(data) {
    // Implement import logic similar to local DB
    // Loop and POST
    // For brevity, leaving as TODO or simple loop
    return { recipesImported: 0, pizzaNightsImported: 0, errors: [] };
}

export async function clearAllData() {
    // Not implemented for safety in SQL mode
    console.warn('Clear all data not implemented for SQL mode');
    return false;
}

// ============================================
// PREPARATION OPERATIONS
// ============================================

/**
 * Create a new preparation
 */
export async function createPreparation(prepData) {
    const preparation = {
        id: prepData.id || generateUUID(),
        name: prepData.name,
        category: prepData.category,
        description: prepData.description || '',
        yield: prepData.yield || 4,
        prepTime: prepData.prepTime || '',
        difficulty: prepData.difficulty || 'Media',
        ingredients: prepData.ingredients || [],
        instructions: prepData.instructions || [],
        tips: prepData.tips || [],
        dateAdded: Date.now(),
        isCustom: prepData.isCustom !== undefined ? prepData.isCustom : true
    };

    const response = await fetch(`${API_URL}/preparations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preparation)
    });

    if (!response.ok) throw new Error('Failed to create preparation');
    return await response.json();
}

/**
 * Get all preparations
 */
export async function getAllPreparations() {
    const response = await fetch(`${API_URL}/preparations`);
    if (!response.ok) throw new Error('Failed to fetch preparations');
    return await response.json();
}

/**
 * Get preparation by ID
 */
export async function getPreparationById(id) {
    const response = await fetch(`${API_URL}/preparations/${id}`);
    if (!response.ok) throw new Error('Failed to fetch preparation');
    return await response.json();
}

/**
 * Update preparation
 */
export async function updatePreparation(id, updates) {
    const response = await fetch(`${API_URL}/preparations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update preparation');
    return await response.json();
}

/**
 * Delete preparation
 */
export async function deletePreparation(id) {
    const response = await fetch(`${API_URL}/preparations/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete preparation');
    return true;
}

/**
 * Initialize preparations from constants if empty
 */
export async function seedPreparations(preparationsConstants) {
    try {
        const existing = await getAllPreparations();
        if (existing.length > 0) {
            console.log('Preparations already seeded, skipping...');
            return;
        }

        console.log('Seeding preparations from constants...');
        for (const prep of preparationsConstants) {
            await createPreparation({ ...prep, isCustom: false });
        }
        console.log(`Seeded ${preparationsConstants.length} preparations`);
    } catch (error) {
        console.error('Error seeding preparations:', error);
    }
}

// ============================================
// INGREDIENTS OPERATIONS
// ============================================

export async function getAllIngredients() {
    const response = await fetch(`${API_URL}/ingredients`);
    if (!response.ok) throw new Error('Failed to fetch ingredients');
    return await response.json();
}

export async function getIngredientById(id) {
    const response = await fetch(`${API_URL}/ingredients/${id}`);
    if (!response.ok) throw new Error('Failed to fetch ingredient');
    return await response.json();
}

export async function getIngredientsByCategory(category) {
    const response = await fetch(`${API_URL}/ingredients/category/${encodeURIComponent(category)}`);
    if (!response.ok) throw new Error('Failed to fetch ingredients by category');
    return await response.json();
}

export async function searchIngredients(query) {
    const response = await fetch(`${API_URL}/ingredients/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search ingredients');
    return await response.json();
}

export async function addIngredient(ingredientData) {
    const ingredient = {
        id: generateUUID(),
        name: ingredientData.name,
        category: ingredientData.category,
        subcategory: ingredientData.subcategory || null,
        minWeight: ingredientData.minWeight || null,
        maxWeight: ingredientData.maxWeight || null,
        defaultUnit: ingredientData.defaultUnit || 'g',
        postBake: ingredientData.postBake || false,
        phase: ingredientData.phase || 'topping',
        season: ingredientData.season || null,
        allergens: ingredientData.allergens || [],
        tags: ingredientData.tags || [],
        isCustom: ingredientData.isCustom !== undefined ? ingredientData.isCustom : true,
        dateAdded: Date.now()
    };

    const response = await fetch(`${API_URL}/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingredient)
    });

    if (!response.ok) throw new Error('Failed to add ingredient');
    return await response.json();
}

export async function updateIngredient(id, updates) {
    const response = await fetch(`${API_URL}/ingredients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update ingredient');
    return await response.json();
}

export async function deleteIngredient(id) {
    const response = await fetch(`${API_URL}/ingredients/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete ingredient');
    return await response.json();
}

