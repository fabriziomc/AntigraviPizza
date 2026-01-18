// ============================================
// DATABASE MODULE - SQL Server Operations
// ============================================

import { generateUUID } from '../utils/helpers.js';
import { getToken } from './auth.js';

// Use relative URL so it works both locally (with proxy) and in production
const API_URL = '/api';

/**
 * Helper function to add auth headers to fetch requests
 */
function authFetch(url, options = {}) {
    const token = getToken();
    console.log(`📡 [authFetch] Requesting: ${url}, Token present: ${!!token}, Token length: ${token ? token.length : 0}`);
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        }
    });
}

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
        archetype: recipeData.archetype || '',
        recipeSource: recipeData.recipeSource || null,      // 'manual', 'archetype', 'combination'
        archetypeUsed: recipeData.archetypeUsed || null     // Name of archetype if applicable
    };

    const response = await authFetch(`${API_URL}/recipes`, {
        method: 'POST',
        body: JSON.stringify(recipe)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add recipe');
    }
    return await response.json();
}

export async function getAllRecipes() {
    const response = await authFetch(`${API_URL}/recipes`);
    if (!response.ok) throw new Error('Failed to fetch recipes');
    return await response.json();
}

export async function getRecipeById(id) {
    const response = await authFetch(`${API_URL}/recipes/${id}?t=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch recipe');
    return await response.json();
}

export async function updateRecipe(id, updates) {
    const response = await authFetch(`${API_URL}/recipes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update recipe');
    return await response.json();
}

export async function deleteRecipe(id) {
    const response = await authFetch(`${API_URL}/recipes/${id}`, {
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
        selectedDough: nightData.selectedDough || null,
        availableIngredients: nightData.availableIngredients || [],
        selectedPizzas: nightData.selectedPizzas || [],
        selectedGuests: nightData.selectedGuests || [],
        notes: nightData.notes || '',
        status: 'planned',
        createdAt: Date.now()
    };

    const response = await authFetch(`${API_URL}/pizza-nights`, {
        method: 'POST',
        body: JSON.stringify(pizzaNight)
    });
    if (!response.ok) throw new Error('Failed to create pizza night');
    return await response.json();
}

export async function getAllPizzaNights() {
    console.log('🌐 [DB-SQL] Fetching all pizza nights...');
    // Add timestamp to prevent caching
    const response = await authFetch(`${API_URL}/pizza-nights?t=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch pizza nights');
    const data = await response.json();
    console.log('🌐 [DB-SQL] Fetched pizza nights counts:', data.length);
    return data;
}

export async function getPizzaNightById(id) {
    console.log(`🌐 [DB-SQL] Fetching pizza night ${id}...`);
    const response = await authFetch(`${API_URL}/pizza-nights/${id}`);
    if (!response.ok) {
        console.warn(`Failed to fetch pizza night ${id}`);
        return null;
    }
    return await response.json();
}

export async function updatePizzaNight(id, updates) {
    console.log(`🌐 [DB-SQL] Updating pizza night ${id}...`);
    const response = await authFetch(`${API_URL}/pizza-nights/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update pizza night');
    const result = await response.json();
    console.log(`🌐 [DB-SQL] Update successful for ${id}`);
    return result;
}

export async function deletePizzaNight(id) {
    const response = await authFetch(`${API_URL}/pizza-nights/${id}`, {
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
        email: guestData.email || null,
        phone: guestData.phone || null,
        createdAt: Date.now()
    };
    const response = await authFetch(`${API_URL}/guests`, {
        method: 'POST',
        body: JSON.stringify(guest)
    });
    if (!response.ok) throw new Error('Failed to add guest');
    return await response.json();
}

export async function updateGuest(guestId, updates) {
    const response = await authFetch(`${API_URL}/guests/${guestId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update guest');
    return await response.json();
}

export async function getAllGuests() {
    const response = await authFetch(`${API_URL}/guests`);
    if (!response.ok) throw new Error('Failed to fetch guests');
    return await response.json();
}

export async function deleteGuest(id) {
    const response = await authFetch(`${API_URL}/guests/${id}`, {
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
    const response = await authFetch(`${API_URL}/combinations`, {
        method: 'POST',
        body: JSON.stringify(combination)
    });
    if (!response.ok) throw new Error('Failed to add combination');
    return await response.json();
}

export async function getAllCombinations() {
    const response = await authFetch(`${API_URL}/combinations`);
    if (!response.ok) throw new Error('Failed to fetch combinations');
    return await response.json();
}

export async function deleteCombination(id) {
    const response = await authFetch(`${API_URL}/combinations/${id}`, {
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
    const guests = await getAllGuests();
    const preparations = await getAllPreparations();
    const ingredients = await getAllIngredients();
    const combinations = await getAllCombinations();
    const categories = await getAllCategories();

    return {
        version: '2.0',
        timestamp: new Date().toISOString(),
        data: {
            recipes,
            pizzaNights,
            guests,
            preparations: preparations.filter(p => p.isCustom), // Only export custom preparations
            ingredients: ingredients.filter(i => i.isCustom),   // Only export custom ingredients
            combinations,
            categories
        }
    };
}

export async function importData(backupData) {
    if (!backupData || !backupData.data) {
        throw new Error('Invalid backup data format');
    }

    const { recipes, pizzaNights, guests, preparations, ingredients, combinations } = backupData.data;
    const results = {
        recipes: 0,
        pizzaNights: 0,
        guests: 0,
        preparations: 0,
        ingredients: 0,
        errors: []
    };

    try {
        // 1. Clear existing data
        console.log('🧹 [importData] Clearing existing data...');
        await clearAllData();

        // Map to store oldId -> newId mappings
        const idMap = {
            guests: {},
            recipes: {},
            ingredients: {},
            preparations: {}
        };

        // 2. Import Custom Ingredients (Regenerate IDs)
        if (ingredients && Array.isArray(ingredients)) {
            for (const item of ingredients) {
                if (item.isCustom) {
                    const oldId = item.id;
                    const newId = generateUUID();
                    idMap.ingredients[oldId] = newId;

                    const newItem = { ...item, id: newId };

                    try {
                        await authFetch(`${API_URL}/ingredients`, {
                            method: 'POST',
                            body: JSON.stringify(newItem)
                        });
                        results.ingredients++;
                    } catch (e) {
                        // console.warn('Skipping ingredient:', item.name);
                    }
                }
            }
        }

        // 3. Import Custom Preparations (Regenerate IDs)
        // Note: Preparations might use Ingredients. We should update those references too.
        if (preparations && Array.isArray(preparations)) {
            for (const item of preparations) {
                if (item.isCustom) {
                    const oldId = item.id;
                    const newId = generateUUID();
                    idMap.preparations[oldId] = newId;

                    // Update ingredients inside preparation
                    let updatedIngredients = item.ingredients || [];
                    if (Array.isArray(updatedIngredients)) {
                        updatedIngredients = updatedIngredients.map(ing => ({
                            ...ing,
                            id: idMap.ingredients[ing.id] || ing.id
                        }));
                    }

                    const newItem = {
                        ...item,
                        id: newId,
                        ingredients: updatedIngredients
                    };

                    try {
                        await authFetch(`${API_URL}/preparations`, {
                            method: 'POST',
                            body: JSON.stringify(newItem)
                        });
                        results.preparations++;
                    } catch (e) {
                        // console.warn('Skipping preparation:', item.name);
                    }
                }
            }
        }

        // 4. Import Guests (Regenerate IDs)
        if (guests && Array.isArray(guests)) {
            for (const item of guests) {
                const oldId = item.id;
                const newId = generateUUID(); // Generate new ID
                idMap.guests[oldId] = newId;

                const newItem = { ...item, id: newId };

                try {
                    await authFetch(`${API_URL}/guests`, {
                        method: 'POST',
                        body: JSON.stringify(newItem)
                    });
                    results.guests++;
                } catch (e) {
                    console.warn('Failed to import guest:', item.name, e);
                    results.errors.push(`Guest: ${item.name} (${e.message})`);
                }
            }
        }

        // 5. Import Recipes (Regenerate IDs & Update internal refs)
        if (recipes && Array.isArray(recipes)) {
            for (const item of recipes) {
                const oldId = item.id;
                const newId = generateUUID();
                idMap.recipes[oldId] = newId;

                // Update Base Ingredients
                let updatedBaseIngredients = item.baseIngredients || [];
                if (Array.isArray(updatedBaseIngredients)) {
                    updatedBaseIngredients = updatedBaseIngredients.map(ing => ({
                        ...ing,
                        id: idMap.ingredients[ing.id] || ing.id
                    }));
                }

                // Update Preparations references
                let updatedPreparations = item.preparations || [];
                if (Array.isArray(updatedPreparations)) {
                    updatedPreparations = updatedPreparations.map(prep => ({
                        ...prep,
                        id: idMap.preparations[prep.id] || prep.id
                    }));
                }

                // Update Toppings (During Bake)
                let updatedToppingsDuring = item.toppingsDuringBake || [];
                if (Array.isArray(updatedToppingsDuring)) {
                    updatedToppingsDuring = updatedToppingsDuring.map(ing => ({
                        ...ing,
                        id: idMap.ingredients[ing.id] || ing.id
                    }));
                }

                // Update Toppings (Post Bake)
                let updatedToppingsPost = item.toppingsPostBake || [];
                if (Array.isArray(updatedToppingsPost)) {
                    updatedToppingsPost = updatedToppingsPost.map(ing => ({
                        ...ing,
                        id: idMap.ingredients[ing.id] || ing.id
                    }));
                }

                const newItem = {
                    ...item,
                    id: newId,
                    baseIngredients: updatedBaseIngredients,
                    preparations: updatedPreparations,
                    toppingsDuringBake: updatedToppingsDuring,
                    toppingsPostBake: updatedToppingsPost
                };

                try {
                    await authFetch(`${API_URL}/recipes`, {
                        method: 'POST',
                        body: JSON.stringify(newItem)
                    });
                    results.recipes++;
                } catch (e) {
                    console.warn('Failed to import recipe:', item.name, e);
                    results.errors.push(`Recipe: ${item.name} (${e.message})`);
                }
            }
        }

        // 6. Import Pizza Nights (Regenerate IDs & Update Refs)
        if (pizzaNights && Array.isArray(pizzaNights)) {
            for (const item of pizzaNights) {
                // Update Selected Pizzas (Recipe IDs)
                let updatedPizzas = [];
                if (item.selectedPizzas && Array.isArray(item.selectedPizzas)) {
                    updatedPizzas = item.selectedPizzas.map(pid => idMap.recipes[pid] || pid);
                }

                // Update Selected Guests (Guest IDs)
                let updatedGuests = [];
                if (item.selectedGuests && Array.isArray(item.selectedGuests)) {
                    updatedGuests = item.selectedGuests.map(gid => idMap.guests[gid] || gid);
                }

                // Update Available Ingredients in Pizza Night (if stored by ID)
                // Assuming it's a list of IDs? Check schema.
                // db-adapter parsePizzaNight: JSON.parse(record.availableIngredients || '[]')
                // Usually it's a list of IDs selected for the night.
                let updatedAvailableIngredients = item.availableIngredients || [];
                if (Array.isArray(updatedAvailableIngredients)) {
                    // Check if it's strings (IDs) or objects
                    if (updatedAvailableIngredients.length > 0 && typeof updatedAvailableIngredients[0] === 'string') {
                        updatedAvailableIngredients = updatedAvailableIngredients.map(iid => idMap.ingredients[iid] || iid);
                    } else if (updatedAvailableIngredients.length > 0 && typeof updatedAvailableIngredients[0] === 'object') {
                        updatedAvailableIngredients = updatedAvailableIngredients.map(ing => ({
                            ...ing,
                            id: idMap.ingredients[ing.id] || ing.id
                        }));
                    }
                }

                const newItem = {
                    ...item,
                    id: generateUUID(), // New ID for Night
                    selectedPizzas: updatedPizzas,
                    selectedGuests: updatedGuests,
                    availableIngredients: updatedAvailableIngredients
                };

                try {
                    await authFetch(`${API_URL}/pizza-nights`, {
                        method: 'POST',
                        body: JSON.stringify(newItem)
                    });
                    results.pizzaNights++;
                } catch (e) {
                    console.warn('Failed to import pizza night:', item.name, e);
                    results.errors.push(`Pizza Night: ${item.name} (${e.message})`);
                }
            }
        }

        // 7. Import Combinations (Regenerate IDs just in case)
        if (combinations && Array.isArray(combinations)) {
            for (const item of combinations) {
                try {
                    const newItem = { ...item, id: generateUUID() };
                    await authFetch(`${API_URL}/combinations`, {
                        method: 'POST',
                        body: JSON.stringify(newItem)
                    });
                } catch (e) {
                    // Ignore combination errors
                }
            }
        }

        return results;

    } catch (error) {
        console.error('Import failed:', error);
        throw error;
    }
}

export async function clearAllData() {
    console.log('⚠️ [clearAllData] Starting wipe of user data...');
    try {
        // Delete Pizza Nights
        const nights = await getAllPizzaNights();
        for (const night of nights) {
            await deletePizzaNight(night.id);
        }

        // Delete Recipes
        const recipes = await getAllRecipes();
        for (const recipe of recipes) {
            await deleteRecipe(recipe.id);
        }

        // Delete Guests
        const guests = await getAllGuests();
        for (const guest of guests) {
            await deleteGuest(guest.id);
        }

        // Delete Combinations
        const combinations = await getAllCombinations();
        for (const combo of combinations) {
            await deleteCombination(combo.id);
        }

        // Note: We don't delete Ingredients/Preparations individually to avoid deleting system ones accidentally
        // or because filtering "custom only" is safer via import.
        // If we want to clean custom ones, we'd need to fetch and filter.

        console.log('✅ [clearAllData] Wipe complete.');
        return true;
    } catch (error) {
        console.error('Failed to clear data:', error);
        throw new Error('Failed to clear existing data before import');
    }
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

    const response = await authFetch(`${API_URL}/preparations`, {
        method: 'POST',
        body: JSON.stringify(preparation)
    });

    if (!response.ok) throw new Error('Failed to create preparation');
    return await response.json();
}

/**
 * Get all preparations
 */
export async function getAllPreparations() {
    const response = await authFetch(`${API_URL}/preparations`);
    if (!response.ok) throw new Error('Failed to fetch preparations');
    return await response.json();
}

/**
 * Get preparation by ID
 */
export async function getPreparationById(id) {
    const response = await authFetch(`${API_URL}/preparations/${id}`);
    if (!response.ok) throw new Error('Failed to fetch preparation');
    return await response.json();
}

/**
 * Update preparation
 */
export async function updatePreparation(id, updates) {
    const response = await authFetch(`${API_URL}/preparations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update preparation');
    return await response.json();
}

/**
 * Delete preparation
 */
export async function deletePreparation(id) {
    const response = await authFetch(`${API_URL}/preparations/${id}`, {
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
    const response = await authFetch(`${API_URL}/ingredients`);
    if (!response.ok) throw new Error('Failed to fetch ingredients');
    return await response.json();
}

export async function getIngredientById(id) {
    const response = await authFetch(`${API_URL}/ingredients/${id}`);
    if (!response.ok) throw new Error('Failed to fetch ingredient');
    return await response.json();
}

export async function getIngredientsByCategory(category) {
    const response = await authFetch(`${API_URL}/ingredients/category/${encodeURIComponent(category)}`);
    if (!response.ok) throw new Error('Failed to fetch ingredients by category');
    return await response.json();
}

export async function searchIngredients(query) {
    const response = await authFetch(`${API_URL}/ingredients/search?q=${encodeURIComponent(query)}`);
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

    const response = await authFetch(`${API_URL}/ingredients`, {
        method: 'POST',
        body: JSON.stringify(ingredient)
    });

    if (!response.ok) throw new Error('Failed to add ingredient');
    return await response.json();
}

export async function updateIngredient(id, updates) {
    const response = await authFetch(`${API_URL}/ingredients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update ingredient');
    return await response.json();
}

export async function deleteIngredient(id) {
    const response = await authFetch(`${API_URL}/ingredients/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete ingredient');
    return await response.json();
}

// ============================================
// CATEGORIES
// ============================================

export async function getAllCategories() {
    const response = await authFetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
}

export async function getCategoryById(id) {
    const response = await authFetch(`${API_URL}/categories/${id}`);
    if (!response.ok) throw new Error('Failed to fetch category');
    return await response.json();
}

// ============================================
// USER SETTINGS
// ============================================

export async function getUserSettings() {
    const response = await authFetch(`${API_URL}/user-settings`);
    if (!response.ok) throw new Error('Failed to fetch user settings');
    return await response.json();
}

export async function updateUserSettings(updates) {
    const response = await authFetch(`${API_URL}/user-settings`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update user settings');
    return await response.json();
}

// ============================================
// ARCHETYPE WEIGHTS
// ============================================

export async function getArchetypeWeights() {
    const response = await authFetch(`${API_URL}/archetype-weights`);
    if (!response.ok) throw new Error('Failed to fetch archetype weights');
    return response.json();
}

export async function updateArchetypeWeight(archetype, weight) {
    const response = await authFetch(`${API_URL}/archetype-weights/${archetype}`, {
        method: 'PUT',
        body: JSON.stringify({ weight })
    });
    if (!response.ok) throw new Error('Failed to update archetype weight');
    return response.json();
}

export async function resetArchetypeWeights() {
    const response = await authFetch(`${API_URL}/archetype-weights/reset`, {
        method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to reset archetype weights');
    return response.json();
}

export async function seedDatabase() {
    const response = await authFetch(`${API_URL}/seed`, {
        method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to seed database');
    return await response.json();
}

