import { CONFIG } from '../config.js';
import * as LocalDB from './database-local.js';
import * as SqlDB from './database-sql.js';

const useSql = CONFIG.USE_SQL_BACKEND;
const activeDB = useSql ? SqlDB : LocalDB;

console.log(`Database Mode: ${useSql ? 'SQL Server' : 'Local IndexedDB'}`);

export const initDB = activeDB.initDB;
export const initSeedData = activeDB.initSeedData;
export const getDB = activeDB.getDB;
export const addRecipe = activeDB.addRecipe;
export const getAllRecipes = activeDB.getAllRecipes;
export const getRecipeById = activeDB.getRecipeById;
export const updateRecipe = activeDB.updateRecipe;
export const deleteRecipe = activeDB.deleteRecipe;
export const toggleFavorite = activeDB.toggleFavorite;
export const getFavoriteRecipes = activeDB.getFavoriteRecipes;
export const searchRecipes = activeDB.searchRecipes;
export const getRecipesByTag = activeDB.getRecipesByTag;
export const createPizzaNight = activeDB.createPizzaNight;
export const getAllPizzaNights = activeDB.getAllPizzaNights;
export const getPizzaNightById = activeDB.getPizzaNightById;
export const updatePizzaNight = activeDB.updatePizzaNight;
export const deletePizzaNight = activeDB.deletePizzaNight;
export const completePizzaNight = activeDB.completePizzaNight;
export const getUpcomingPizzaNights = activeDB.getUpcomingPizzaNights;
export const addGuest = activeDB.addGuest;
export const getAllGuests = activeDB.getAllGuests;
export const updateGuest = activeDB.updateGuest;
export const deleteGuest = activeDB.deleteGuest;
export const addCombination = activeDB.addCombination;
export const getAllCombinations = activeDB.getAllCombinations;
export const deleteCombination = activeDB.deleteCombination;
export const initCombinations = activeDB.initCombinations;
export const exportData = activeDB.exportData;
export const importData = activeDB.importData;
export const clearAllData = activeDB.clearAllData;
export const createPreparation = activeDB.createPreparation;
export const getAllPreparations = activeDB.getAllPreparations;
export const getPreparationById = activeDB.getPreparationById;
export const updatePreparation = activeDB.updatePreparation;
export const deletePreparation = activeDB.deletePreparation;
export const seedPreparations = activeDB.seedPreparations;

// Ingredients
export const getAllIngredients = activeDB.getAllIngredients;
export const getIngredientById = activeDB.getIngredientById;
export const getIngredientsByCategory = activeDB.getIngredientsByCategory;
export const searchIngredients = activeDB.searchIngredients;
export const addIngredient = activeDB.addIngredient;
export const updateIngredient = activeDB.updateIngredient;
export const deleteIngredient = activeDB.deleteIngredient;

// Archetype Weights
export const getArchetypeWeights = activeDB.getArchetypeWeights;
export const updateArchetypeWeight = activeDB.updateArchetypeWeight;
export const resetArchetypeWeights = activeDB.resetArchetypeWeights;

// Categories
export const getAllCategories = activeDB.getAllCategories;
export const getCategoryById = activeDB.getCategoryById;

// User Settings
export const getUserSettings = activeDB.getUserSettings;
export const updateUserSettings = activeDB.updateUserSettings;

