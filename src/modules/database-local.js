// ============================================
// DATABASE MODULE - IndexedDB Operations
// ============================================

import { DB_NAME, DB_VERSION, STORES } from '../utils/constants.js';
import { generateUUID } from '../utils/helpers.js';

let db = null;

/**
 * Initialize IndexedDB
 */
export async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // Create recipes store
            if (!database.objectStoreNames.contains(STORES.RECIPES)) {
                const recipesStore = database.createObjectStore(STORES.RECIPES, { keyPath: 'id' });
                recipesStore.createIndex('name', 'name', { unique: false });
                recipesStore.createIndex('pizzaiolo', 'pizzaiolo', { unique: false });
                recipesStore.createIndex('dateAdded', 'dateAdded', { unique: false });
                recipesStore.createIndex('isFavorite', 'isFavorite', { unique: false });
            }

            // Create pizza nights store
            if (!database.objectStoreNames.contains(STORES.PIZZA_NIGHTS)) {
                const nightsStore = database.createObjectStore(STORES.PIZZA_NIGHTS, { keyPath: 'id' });
                nightsStore.createIndex('date', 'date', { unique: false });
                nightsStore.createIndex('status', 'status', { unique: false });
            }

            // Create guests store
            if (!database.objectStoreNames.contains(STORES.GUESTS)) {
                const guestsStore = database.createObjectStore(STORES.GUESTS, { keyPath: 'id' });
                guestsStore.createIndex('name', 'name', { unique: false });
            }

            // Create combinations store
            if (!database.objectStoreNames.contains(STORES.COMBINATIONS)) {
                const combinationsStore = database.createObjectStore(STORES.COMBINATIONS, { keyPath: 'id' });
                combinationsStore.createIndex('ingredients', 'ingredients', { unique: false });
            }

            // Create preparations store
            if (!database.objectStoreNames.contains(STORES.PREPARATIONS)) {
                const preparationsStore = database.createObjectStore(STORES.PREPARATIONS, { keyPath: 'id' });
                preparationsStore.createIndex('category', 'category', { unique: false });
                preparationsStore.createIndex('difficulty', 'difficulty', { unique: false });
                preparationsStore.createIndex('name', 'name', { unique: false });
            }
        };
    });
}

/**
 * Initialize seed data if database is empty
 */
export async function initSeedData() {
    try {
        // Check if seed data has already been loaded
        const seedLoaded = localStorage.getItem('seedDataLoaded');
        if (seedLoaded === 'true') {
            console.log('Seed data already loaded, skipping...');
            return;
        }

        // Check if database already has recipes
        const existingRecipes = await getAllRecipes();
        if (existingRecipes.length > 0) {
            console.log('Database already has recipes, skipping seed data...');
            localStorage.setItem('seedDataLoaded', 'true');
            return;
        }

        console.log('Loading seed data...');

        // Fetch seed data from public folder
        const response = await fetch('/seed-data.json');
        if (!response.ok) {
            throw new Error('Failed to load seed data');
        }

        const seedData = await response.json();

        // Import the data
        const results = await importData(seedData);

        console.log(`Seed data loaded: ${results.recipesImported} recipes imported`);

        // Mark seed data as loaded
        localStorage.setItem('seedDataLoaded', 'true');

        return results;
    } catch (error) {
        console.error('Error loading seed data:', error);
        // Don't throw - app should still work even if seed data fails
    }
}

/**
 * Get database instance
 */
export function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call initDB() first.');
    }
    return db;
}

// ============================================
// RECIPE OPERATIONS
// ============================================

/**
 * Add a new recipe
 */
export async function addRecipe(recipeData) {
    const recipe = {
        id: generateUUID(),
        name: recipeData.name,
        pizzaiolo: recipeData.pizzaiolo || 'Sconosciuto',
        source: recipeData.source || '',
        description: recipeData.description || '',
        // Support both old and new format
        baseIngredients: recipeData.baseIngredients || recipeData.ingredients || [],
        ingredients: recipeData.ingredients || recipeData.baseIngredients || [], // Keep for backward compatibility
        preparations: recipeData.preparations || [],
        instructions: recipeData.instructions || [],
        imageUrl: recipeData.imageUrl || '',
        dough: recipeData.dough || '',
        suggestedDough: recipeData.suggestedDough || recipeData.dough || '',
        tags: recipeData.tags || [],
        dateAdded: Date.now(),
        isFavorite: false
    };

    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.RECIPES], 'readwrite');
        const store = transaction.objectStore(STORES.RECIPES);
        const request = store.add(recipe);

        request.onsuccess = () => resolve(recipe);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get all recipes
 */
export async function getAllRecipes() {
    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.RECIPES], 'readonly');
        const store = transaction.objectStore(STORES.RECIPES);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get recipe by ID
 */
export async function getRecipeById(id) {
    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.RECIPES], 'readonly');
        const store = transaction.objectStore(STORES.RECIPES);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Update recipe
 */
export async function updateRecipe(id, updates) {
    const recipe = await getRecipeById(id);
    if (!recipe) {
        throw new Error('Recipe not found');
    }

    const updatedRecipe = { ...recipe, ...updates, id };

    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.RECIPES], 'readwrite');
        const store = transaction.objectStore(STORES.RECIPES);
        const request = store.put(updatedRecipe);

        request.onsuccess = () => resolve(updatedRecipe);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete recipe
 */
export async function deleteRecipe(id) {
    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.RECIPES], 'readwrite');
        const store = transaction.objectStore(STORES.RECIPES);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Toggle recipe favorite status
 */
export async function toggleFavorite(id) {
    const recipe = await getRecipeById(id);
    if (!recipe) {
        throw new Error('Recipe not found');
    }

    return updateRecipe(id, { isFavorite: !recipe.isFavorite });
}

/**
 * Get favorite recipes
 */
export async function getFavoriteRecipes() {
    const allRecipes = await getAllRecipes();
    return allRecipes.filter(recipe => recipe.isFavorite);
}

/**
 * Search recipes
 */
export async function searchRecipes(searchTerm) {
    const allRecipes = await getAllRecipes();
    const term = searchTerm.toLowerCase();

    return allRecipes.filter(recipe => {
        return recipe.name.toLowerCase().includes(term) ||
            recipe.pizzaiolo.toLowerCase().includes(term) ||
            recipe.description.toLowerCase().includes(term) ||
            recipe.tags.some(tag => tag.toLowerCase().includes(term));
    });
}

/**
 * Get recipes by tag
 */
export async function getRecipesByTag(tag) {
    const allRecipes = await getAllRecipes();
    return allRecipes.filter(recipe => recipe.tags.includes(tag));
}

// ============================================
// PIZZA NIGHT OPERATIONS
// ============================================

/**
 * Create a new pizza night
 */
export async function createPizzaNight(nightData) {
    const pizzaNight = {
        id: generateUUID(),
        name: nightData.name,
        date: nightData.date || Date.now(),
        guestCount: nightData.guestCount || 6,
        selectedDough: nightData.selectedDough || null, // NUOVO: impasto scelto per la serata
        selectedPizzas: nightData.selectedPizzas || [], // [{ recipeId, quantity }]
        selectedGuests: nightData.selectedGuests || [], // [guestId]
        notes: nightData.notes || '',
        status: 'planned',
        createdAt: Date.now()
    };

    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.PIZZA_NIGHTS], 'readwrite');
        const store = transaction.objectStore(STORES.PIZZA_NIGHTS);
        const request = store.add(pizzaNight);

        request.onsuccess = () => resolve(pizzaNight);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get all pizza nights
 */
export async function getAllPizzaNights() {
    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.PIZZA_NIGHTS], 'readonly');
        const store = transaction.objectStore(STORES.PIZZA_NIGHTS);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get pizza night by ID
 */
export async function getPizzaNightById(id) {
    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.PIZZA_NIGHTS], 'readonly');
        const store = transaction.objectStore(STORES.PIZZA_NIGHTS);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Update pizza night
 */
export async function updatePizzaNight(id, updates) {
    const pizzaNight = await getPizzaNightById(id);
    if (!pizzaNight) {
        throw new Error('Pizza night not found');
    }

    const updatedNight = { ...pizzaNight, ...updates, id };

    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.PIZZA_NIGHTS], 'readwrite');
        const store = transaction.objectStore(STORES.PIZZA_NIGHTS);
        const request = store.put(updatedNight);

        request.onsuccess = () => resolve(updatedNight);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete pizza night
 */
export async function deletePizzaNight(id) {
    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.PIZZA_NIGHTS], 'readwrite');
        const store = transaction.objectStore(STORES.PIZZA_NIGHTS);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Mark pizza night as completed
 */
export async function completePizzaNight(id) {
    return updatePizzaNight(id, { status: 'completed' });
}

/**
 * Get upcoming pizza nights
 */
export async function getUpcomingPizzaNights() {
    const allNights = await getAllPizzaNights();
    const now = Date.now();
    return allNights
        .filter(night => night.date >= now && night.status === 'planned')
        .filter(night => night.date >= now && night.status === 'planned')
        .sort((a, b) => a.date - b.date);
}

// ============================================
// GUEST OPERATIONS
// ============================================

/**
 * Add a new guest
 */
export async function addGuest(guestData) {
    const guest = {
        id: generateUUID(),
        name: guestData.name,
        createdAt: Date.now()
    };

    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.GUESTS], 'readwrite');
        const store = transaction.objectStore(STORES.GUESTS);
        const request = store.add(guest);

        request.onsuccess = () => resolve(guest);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get all guests
 */
export async function getAllGuests() {
    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.GUESTS], 'readonly');
        const store = transaction.objectStore(STORES.GUESTS);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete guest
 */
export async function deleteGuest(id) {
    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.GUESTS], 'readwrite');
        const store = transaction.objectStore(STORES.GUESTS);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

// ============================================
// COMBINATION OPERATIONS
// ============================================

/**
 * Add a new combination
 */
export async function addCombination(ingredients) {
    const combination = {
        id: generateUUID(),
        ingredients: ingredients,
        createdAt: Date.now()
    };

    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.COMBINATIONS], 'readwrite');
        const store = transaction.objectStore(STORES.COMBINATIONS);
        const request = store.add(combination);

        request.onsuccess = () => resolve(combination);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get all combinations
 */
export async function getAllCombinations() {
    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.COMBINATIONS], 'readonly');
        const store = transaction.objectStore(STORES.COMBINATIONS);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete combination
 */
export async function deleteCombination(id) {
    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.COMBINATIONS], 'readwrite');
        const store = transaction.objectStore(STORES.COMBINATIONS);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Initialize default combinations if empty
 */
export async function initCombinations(defaultCombinations) {
    const existing = await getAllCombinations();
    if (existing.length === 0) {
        console.log('Initializing default combinations...');
        for (const combo of defaultCombinations) {
            await addCombination(combo);
        }
    }
}

// ============================================
// DATA EXPORT/IMPORT
// ============================================

/**
 * Export all data
 */
export async function exportData() {
    const recipes = await getAllRecipes();
    const pizzaNights = await getAllPizzaNights();

    return {
        version: DB_VERSION,
        exportDate: Date.now(),
        recipes,
        pizzaNights
    };
}

/**
 * Import data
 */
export async function importData(data) {
    if (!data.recipes && !data.pizzaNights) {
        throw new Error('Invalid data format');
    }

    const results = {
        recipesImported: 0,
        pizzaNightsImported: 0,
        errors: []
    };

    // Import recipes
    if (data.recipes && Array.isArray(data.recipes)) {
        for (const recipe of data.recipes) {
            try {
                await addRecipe(recipe);
                results.recipesImported++;
            } catch (error) {
                results.errors.push(`Failed to import recipe: ${recipe.name}`);
            }
        }
    }

    // Import pizza nights
    if (data.pizzaNights && Array.isArray(data.pizzaNights)) {
        for (const night of data.pizzaNights) {
            try {
                await createPizzaNight(night);
                results.pizzaNightsImported++;
            } catch (error) {
                results.errors.push(`Failed to import pizza night: ${night.name}`);
            }
        }
    }

    return results;
}

/**
 * Clear all data
 */
export async function clearAllData() {
    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.RECIPES, STORES.PIZZA_NIGHTS], 'readwrite');

        const recipesStore = transaction.objectStore(STORES.RECIPES);
        const nightsStore = transaction.objectStore(STORES.PIZZA_NIGHTS);

        recipesStore.clear();
        nightsStore.clear();

        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(transaction.error);
    });
}

// ============================================
// PREPARATION OPERATIONS
// ============================================

/**
 * Add a new preparation
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

    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.PREPARATIONS], 'readwrite');
        const store = transaction.objectStore(STORES.PREPARATIONS);
        const request = store.add(preparation);

        request.onsuccess = () => resolve(preparation);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get all preparations
 */
export async function getAllPreparations() {
    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.PREPARATIONS], 'readonly');
        const store = transaction.objectStore(STORES.PREPARATIONS);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get preparation by ID
 */
export async function getPreparationById(id) {
    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.PREPARATIONS], 'readonly');
        const store = transaction.objectStore(STORES.PREPARATIONS);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Update preparation
 */
export async function updatePreparation(id, updates) {
    const preparation = await getPreparationById(id);
    if (!preparation) {
        throw new Error('Preparation not found');
    }

    const updatedPreparation = { ...preparation, ...updates, id };

    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.PREPARATIONS], 'readwrite');
        const store = transaction.objectStore(STORES.PREPARATIONS);
        const request = store.put(updatedPreparation);

        request.onsuccess = () => resolve(updatedPreparation);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete preparation
 */
export async function deletePreparation(id) {
    return new Promise((resolve, reject) => {
        const transaction = getDB().transaction([STORES.PREPARATIONS], 'readwrite');
        const store = transaction.objectStore(STORES.PREPARATIONS);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
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
// ARCHETYPE WEIGHTS (Stub functions for IndexedDB mode)
// ============================================

/**
 * Get archetype weights (stub - not supported in IndexedDB mode)
 */
export async function getArchetypeWeights(userId = 'default') {
    console.warn('Archetype weights not supported in IndexedDB mode');
    // Return default weights
    return [
        { archetype: 'combinazioni_db', weight: 30, userId },
        { archetype: 'classica', weight: 28, userId },
        { archetype: 'tradizionale', weight: 21, userId },
        { archetype: 'terra_bosco', weight: 7, userId },
        { archetype: 'fresca_estiva', weight: 7, userId },
        { archetype: 'piccante_decisa', weight: 4, userId },
        { archetype: 'mare', weight: 2, userId },
        { archetype: 'vegana', weight: 1, userId }
    ];
}

/**
 * Update archetype weight (stub - not supported in IndexedDB mode)
 */
export async function updateArchetypeWeight(archetype, weight, userId = 'default') {
    console.warn('Archetype weights not supported in IndexedDB mode');
    return { archetype, weight, userId };
}

/**
 * Reset archetype weights (stub - not supported in IndexedDB mode)
 */
export async function resetArchetypeWeights(userId = 'default') {
    console.warn('Archetype weights not supported in IndexedDB mode');
    return { success: true };
}

