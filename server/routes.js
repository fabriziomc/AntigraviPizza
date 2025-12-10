import express from 'express';
import DatabaseAdapter from './db-adapter.js';

const router = express.Router();
const dbAdapter = new DatabaseAdapter();

// ==========================================
// RECIPES
// ==========================================

// GET all recipes
router.get('/recipes', async (req, res) => {
    try {
        const recipes = await dbAdapter.getAllRecipes();
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single recipe
router.get('/recipes/:id', async (req, res) => {
    try {
        const recipe = await dbAdapter.getRecipeById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE recipe
router.post('/recipes', async (req, res) => {
    try {
        const recipe = await dbAdapter.createRecipe(req.body);
        res.status(201).json(recipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE recipe
router.put('/recipes/:id', async (req, res) => {
    try {
        const recipe = await dbAdapter.updateRecipe(req.params.id, req.body);
        res.json(recipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE recipe
router.delete('/recipes/:id', async (req, res) => {
    try {
        await dbAdapter.deleteRecipe(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// PIZZA NIGHTS
// ==========================================

router.get('/pizza-nights', async (req, res) => {
    try {
        const nights = await dbAdapter.getAllPizzaNights();
        res.json(nights);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/pizza-nights', async (req, res) => {
    try {
        const night = await dbAdapter.createPizzaNight(req.body);
        res.status(201).json(night);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/pizza-nights/:id', async (req, res) => {
    try {
        const night = await dbAdapter.updatePizzaNight(req.params.id, req.body);
        res.json(night);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/pizza-nights/:id', async (req, res) => {
    try {
        await dbAdapter.deletePizzaNight(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// GUESTS
// ==========================================

router.get('/guests', async (req, res) => {
    try {
        const guests = await dbAdapter.getAllGuests();
        res.json(guests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/guests', async (req, res) => {
    try {
        const guest = await dbAdapter.createGuest(req.body);
        res.status(201).json(guest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/guests/:id', async (req, res) => {
    try {
        await dbAdapter.deleteGuest(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// COMBINATIONS
// ==========================================

router.get('/combinations', async (req, res) => {
    try {
        const combos = await dbAdapter.getAllCombinations();
        res.json(combos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/combinations', async (req, res) => {
    try {
        const combo = await dbAdapter.createCombination(req.body);
        res.status(201).json(combo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/combinations/:id', async (req, res) => {
    try {
        await dbAdapter.deleteCombination(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// PREPARATIONS
// ==========================================

router.get('/preparations', async (req, res) => {
    try {
        const preparations = await dbAdapter.getAllPreparations();
        res.json(preparations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/preparations/:id', async (req, res) => {
    try {
        const preparation = await dbAdapter.getPreparationById(req.params.id);
        if (!preparation) {
            return res.status(404).json({ message: 'Preparation not found' });
        }
        res.json(preparation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/preparations', async (req, res) => {
    try {
        const preparation = await dbAdapter.createPreparation(req.body);
        res.status(201).json(preparation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/preparations/:id', async (req, res) => {
    try {
        const preparation = await dbAdapter.updatePreparation(req.params.id, req.body);
        res.json(preparation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/preparations/:id', async (req, res) => {
    try {
        await dbAdapter.deletePreparation(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// INGREDIENTS
// ==========================================

router.get('/ingredients', async (req, res) => {
    try {
        const ingredients = await dbAdapter.getAllIngredients();
        res.json(ingredients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/ingredients/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const ingredients = await dbAdapter.searchIngredients(query);
        res.json(ingredients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/ingredients/category/:category', async (req, res) => {
    try {
        const ingredients = await dbAdapter.getIngredientsByCategory(req.params.category);
        res.json(ingredients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/ingredients/:id', async (req, res) => {
    try {
        const ingredient = await dbAdapter.getIngredientById(req.params.id);
        if (!ingredient) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }
        res.json(ingredient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/ingredients', async (req, res) => {
    try {
        const ingredient = await dbAdapter.createIngredient(req.body);
        res.json(ingredient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/ingredients/:id', async (req, res) => {
    try {
        const ingredient = await dbAdapter.updateIngredient(req.params.id, req.body);
        res.json(ingredient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/ingredients/:id', async (req, res) => {
    try {
        await dbAdapter.deleteIngredient(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

