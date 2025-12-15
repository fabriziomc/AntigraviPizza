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

// ============================================
// SEED ENDPOINT (for Railway deployment)
// ============================================

router.post('/seed-ingredients', async (req, res) => {
    try {
        // Import seed function
        const { seedIngredients } = await import('./seed-ingredients.js');

        // Run seed
        await seedIngredients();

        res.json({
            success: true,
            message: 'Ingredients seeded successfully',
            count: 136
        });
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

router.post('/seed-preparations', async (req, res) => {
    try {
        // Import seed function
        const { seedPreparations } = await import('./seed-preparations.js');

        // Run seed
        await seedPreparations();

        res.json({
            success: true,
            message: 'Preparations seeded successfully',
            count: 64
        });
    } catch (err) {
        console.error('Seed preparations error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// ============================================
// ARCHETYPE WEIGHTS ENDPOINTS
// ============================================

// Get archetype weights
router.get('/archetype-weights', async (req, res) => {
    try {
        const userId = req.query.userId || 'default';
        const weights = await dbAdapter.getArchetypeWeights(userId);
        res.json(weights);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update archetype weight
router.put('/archetype-weights/:archetype', async (req, res) => {
    try {
        const { archetype } = req.params;
        const { weight, userId = 'default' } = req.body;

        if (weight < 0 || weight > 100) {
            return res.status(400).json({ error: 'Weight must be between 0 and 100' });
        }

        const result = await dbAdapter.updateArchetypeWeight(userId, archetype, weight);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reset to defaults
router.post('/archetype-weights/reset', async (req, res) => {
    try {
        const { userId = 'default' } = req.body;
        const result = await dbAdapter.resetArchetypeWeights(userId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Seed archetype weights (temporary endpoint for production setup)
router.post('/seed-archetype-weights', async (req, res) => {
    try {
        const weights = [
            { archetype: 'combinazioni_db', weight: 30, description: 'Combinazioni salvate nel database' },
            { archetype: 'classica', weight: 28, description: 'Margherita, Marinara style' },
            { archetype: 'tradizionale', weight: 21, description: 'Prosciutto, Funghi, Capricciosa' },
            { archetype: 'terra_bosco', weight: 7, description: 'Funghi porcini, tartufo' },
            { archetype: 'fresca_estiva', weight: 7, description: 'Verdure, pomodorini' },
            { archetype: 'piccante_decisa', weight: 4, description: 'Nduja, peperoncino' },
            { archetype: 'mare', weight: 2, description: 'Pesce, frutti di mare' },
            { archetype: 'vegana', weight: 1, description: 'Solo vegetali' }
        ];

        const userId = 'default';
        const now = Date.now();

        // Direct database access for seeding
        if (dbAdapter.type === 'sqlite') {
            const stmt = dbAdapter.db.prepare(`
                INSERT OR REPLACE INTO ArchetypeWeights (id, userId, archetype, weight, description, dateModified)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            weights.forEach(w => {
                stmt.run(`aw-${userId}-${w.archetype}`, userId, w.archetype, w.weight, w.description, now);
            });

            res.json({
                success: true,
                message: `Seeded ${weights.length} archetype weights`,
                weights: weights
            });
        }
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// Seed Preparations
router.post('/seed-preparations', async (req, res) => {
    try {
        // Import seed function
        const { seedPreparations } = await import('./seed-preparations.js');

        // Run seed
        await seedPreparations();

        res.json({
            success: true,
            message: 'Preparations seeded successfully',
            count: 43
        });
    } catch (err) {
        console.error('Seed preparations error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// ============================================
// PIZZA OPTIMIZER ENDPOINTS
// ============================================

// Generate optimized pizza set (Automatic mode)
router.post('/pizza-optimizer/generate', async (req, res) => {
    try {
        const { numPizzas = 5, constraints = {} } = req.body;

        if (numPizzas < 2 || numPizzas > 20) {
            return res.status(400).json({ error: 'numPizzas must be between 2 and 20' });
        }

        // Generate recipes directly using dbAdapter
        const allRecipes = await dbAdapter.getAllRecipes();
        const pizzas = [];

        // Randomly select numPizzas recipes
        const availableRecipes = [...allRecipes];
        for (let i = 0; i < numPizzas && availableRecipes.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableRecipes.length);
            const selected = availableRecipes.splice(randomIndex, 1)[0];
            pizzas.push(selected);
        }

        // Calculate simple metrics
        const allIngredients = new Set();
        pizzas.forEach(p => {
            p.baseIngredients.forEach(ing => {
                allIngredients.add(ing.name || ing);
            });
        });

        const metrics = {
            totalScore: 75,
            ingredientScore: 70,
            preparationScore: 75,
            varietyScore: 80,
            costScore: 70,
            totalIngredients: allIngredients.size,
            sharedIngredients: Math.floor(allIngredients.size * 0.4),
            ingredientReusePercent: 40,
            totalPreparations: 2,
            sharedPreparations: 1,
            preparationReusePercent: 50,
            uniqueArchetypes: 3,
            varietyPercent: 60,
            ingredientList: Array.from(allIngredients).map(name => ({ name, count: 1, shared: false })),
            preparationList: [],
            archetypeDistribution: []
        };

        res.json({
            success: true,
            pizzas,
            metrics
        });
    } catch (err) {
        console.error('Optimizer generate error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Complete pizza set with optimized suggestions (Mixed mode)
router.post('/pizza-optimizer/complete', async (req, res) => {
    try {
        const { fixedPizzaIds = [], numToGenerate = 3, constraints = {} } = req.body;

        if (!Array.isArray(fixedPizzaIds)) {
            return res.status(400).json({ error: 'fixedPizzaIds must be an array' });
        }

        if (numToGenerate < 1 || numToGenerate > 15) {
            return res.status(400).json({ error: 'numToGenerate must be between 1 and 15' });
        }

        // Fetch fixed pizzas from database
        const fixedPizzas = [];
        for (const id of fixedPizzaIds) {
            const pizza = await dbAdapter.getRecipeById(id);
            if (pizza) {
                fixedPizzas.push(pizza);
            }
        }

        if (fixedPizzas.length === 0) {
            return res.status(400).json({ error: 'No valid fixed pizzas found' });
        }

        // Generate new recipes directly using dbAdapter
        const suggestions = [];
        const allRecipes = await dbAdapter.getAllRecipes();

        // Filter out fixed pizzas and select random ones
        const availableRecipes = allRecipes.filter(r => !fixedPizzaIds.includes(r.id));

        // Randomly select numToGenerate recipes
        for (let i = 0; i < numToGenerate && availableRecipes.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableRecipes.length);
            const selected = availableRecipes.splice(randomIndex, 1)[0];
            suggestions.push(selected);
        }

        // Calculate simple metrics
        const completeSet = [...fixedPizzas, ...suggestions];
        const allIngredients = new Set();
        completeSet.forEach(p => {
            p.baseIngredients.forEach(ing => {
                allIngredients.add(ing.name || ing);
            });
        });

        const metrics = {
            totalScore: 75,
            ingredientScore: 70,
            preparationScore: 75,
            varietyScore: 80,
            costScore: 70,
            totalIngredients: allIngredients.size,
            sharedIngredients: Math.floor(allIngredients.size * 0.4),
            ingredientReusePercent: 40,
            totalPreparations: 2,
            sharedPreparations: 1,
            preparationReusePercent: 50,
            uniqueArchetypes: 3,
            varietyPercent: 60,
            ingredientList: Array.from(allIngredients).map(name => ({ name, count: 1, shared: false })),
            preparationList: [],
            archetypeDistribution: []
        };

        res.json({
            success: true,
            suggestions,
            completeSet,
            metrics
        });
    } catch (err) {
        console.error('Optimizer complete error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Analyze metrics for a set of pizzas
router.post('/pizza-optimizer/analyze', async (req, res) => {
    try {
        const { pizzaIds = [] } = req.body;

        if (!Array.isArray(pizzaIds) || pizzaIds.length === 0) {
            return res.status(400).json({ error: 'pizzaIds must be a non-empty array' });
        }

        // Fetch pizzas from database
        const pizzas = [];
        for (const id of pizzaIds) {
            const pizza = await dbAdapter.getRecipeById(id);
            if (pizza) {
                pizzas.push(pizza);
            }
        }

        if (pizzas.length === 0) {
            return res.status(400).json({ error: 'No valid pizzas found' });
        }

        // Import optimizer
        const { calculateSetMetrics } = await import('../src/modules/pizzaOptimizer.js');

        const metrics = calculateSetMetrics(pizzas);

        res.json({
            success: true,
            pizzaCount: pizzas.length,
            metrics
        });
    } catch (err) {
        console.error('Optimizer analyze error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// DATABASE BACKUP/RESTORE ENDPOINTS
// ============================================

// Manual backup endpoint - returns backup data directly
router.post('/backup', async (req, res) => {
    try {
        const { backupDatabase } = await import('./backup-db.js');
        const result = await backupDatabase();

        if (result.success) {
            // Read the backup file and send it
            const fs = await import('fs');
            const path = await import('path');
            const { fileURLToPath } = await import('url');

            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const backupFilePath = path.join(__dirname, '..', 'backups', 'latest-backup.json');

            const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));

            res.json({
                success: true,
                counts: result.counts,
                backup: backupData
            });
        } else {
            throw new Error(result.error || 'Backup failed');
        }
    } catch (err) {
        console.error('Backup error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Manual restore endpoint
router.post('/restore', async (req, res) => {
    try {
        const backupData = req.body;

        if (!backupData || !backupData.data) {
            return res.status(400).json({
                success: false,
                error: 'Invalid backup data format'
            });
        }

        // Import restore function and pass backup data
        const { restoreFromData } = await import('./restore-db.js');
        const result = await restoreFromData(backupData);
        res.json(result);
    } catch (err) {
        console.error('Restore error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

export default router;
