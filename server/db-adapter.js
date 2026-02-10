import { getDb } from './db.js';

// ==========================================
// DATABASE ADAPTER
// ==========================================

/**
 * Adapter pattern to abstract database operations
 * Supports both SQLite (local, sync) and Turso (cloud, async)
 */
class DatabaseAdapter {
    constructor() {
        this.db = getDb();
        // Auto-detect: SQLite has .prepare (sync), Turso has .execute (async)
        this.isSQLite = typeof this.db?.prepare === 'function';
        this.isTurso = typeof this.db?.execute === 'function';

        if (!this.isSQLite && !this.isTurso) {
            throw new Error('Unknown database type - neither SQLite nor Turso detected');
        }
    }

    // Helper to parse JSON fields for SQLite
    parseRecipe(record) {
        if (!record) return null;
        return {
            ...record,
            baseIngredients: record.baseIngredients ? (typeof record.baseIngredients === 'string' ? JSON.parse(record.baseIngredients) : record.baseIngredients) : [],
            toppingsDuringBake: record.toppingsDuringBake ? (typeof record.toppingsDuringBake === 'string' ? JSON.parse(record.toppingsDuringBake) : record.toppingsDuringBake) : [],
            toppingsPostBake: record.toppingsPostBake ? (typeof record.toppingsPostBake === 'string' ? JSON.parse(record.toppingsPostBake) : record.toppingsPostBake) : [],
            preparations: record.preparations ? (typeof record.preparations === 'string' ? JSON.parse(record.preparations) : record.preparations) : [],
            instructions: record.instructions ? (typeof record.instructions === 'string' ? JSON.parse(record.instructions) : record.instructions) : [],
            tags: record.tags ? (typeof record.tags === 'string' ? JSON.parse(record.tags) : record.tags) : [],
            isFavorite: !!record.isFavorite
        };
    }

    parsePizzaNight(record) {
        if (!record) return null;
        return {
            ...record,
            selectedPizzas: typeof record.selectedPizzas === 'string' ? JSON.parse(record.selectedPizzas || '[]') : record.selectedPizzas,
            selectedGuests: typeof record.selectedGuests === 'string' ? JSON.parse(record.selectedGuests || '[]') : record.selectedGuests,
            availableIngredients: typeof record.availableIngredients === 'string' ? JSON.parse(record.availableIngredients || '[]') : (record.availableIngredients || []),
            serviceOrder: record.serviceOrder || '',
            isVotingOpen: !!record.isVotingOpen
        };
    }

    parseCombination(record) {
        if (!record) return null;
        return {
            ...record,
            ingredients: typeof record.ingredients === 'string' ? JSON.parse(record.ingredients || '[]') : record.ingredients
        };
    }

    // ==========================================
    // DATA NORMALIZATION HELPERS
    // ==========================================

    /**
     * Remove embedded ingredient data, keeping only ID references
     * This ensures database normalization - ingredient details are fetched via JOIN
     */
    stripEmbeddedIngredientData(ingredients) {
        if (!ingredients || !Array.isArray(ingredients)) return [];

        return ingredients.map((ing, index) => {
            const cleaned = { ...ing };

            // 🔧 FIXED: Accept both 'id' and 'ingredientId' for backward compatibility
            if (!cleaned.ingredientId && cleaned.id) {
                cleaned.ingredientId = cleaned.id;  // Convert id → ingredientId
            }

            // ⚠️ VALIDATION: Ensure ingredientId is present
            if (!cleaned.ingredientId) {
                console.warn(`⚠️  WARNING: Ingredient at index ${index} missing 'ingredientId'. This will cause display issues!`, ing);
                // Don't save recipes without proper IDs - this prevents corrupt data
                throw new Error(`Ingredient at index ${index} is missing 'ingredientId'. Cannot save unnormalized recipe data.`);
            }

            // Remove embedded data that should come from Ingredients table
            const fieldsToRemove = ['id', 'name', 'category', 'categoryName', 'categoryIcon', 'defaultUnit', 'phase'];
            fieldsToRemove.forEach(field => delete cleaned[field]);

            return cleaned;
        });
    }

    /**
     * Remove embedded preparation data, keeping only ID references
     * This ensures database normalization - preparation details are fetched via JOIN
     */
    stripEmbeddedPreparationData(preparations) {
        if (!preparations || !Array.isArray(preparations)) return [];

        return preparations.map((prep, index) => {
            const cleaned = { ...prep };

            // ⚠️ VALIDATION: Ensure preparationId is present
            if (!cleaned.preparationId && !cleaned.id) {
                console.warn(`⚠️  WARNING: Preparation at index ${index} missing 'preparationId'. This will cause display issues!`, prep);
                throw new Error(`Preparation at index ${index} is missing 'preparationId'. Cannot save unnormalized recipe data.`);
            }

            // Normalize: if using 'id', convert to 'preparationId'
            if (cleaned.id && !cleaned.preparationId) {
                cleaned.preparationId = cleaned.id;
                delete cleaned.id;
            }

            // Remove embedded data that should come from Preparations table
            const fieldsToRemove = ['name', 'category', 'description', 'ingredients', 'instructions', 'tips', 'yield', 'prepTime', 'difficulty'];
            fieldsToRemove.forEach(field => delete cleaned[field]);

            return cleaned;
        });
    }


    // ==========================================
    // RECIPES
    // ==========================================

    async getAllRecipes(userId) {
        let recipes;
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Recipes WHERE userId = ? ORDER BY createdAt DESC');
            recipes = stmt.all(userId).map(r => this.parseRecipe(r));
        } else {
            // Turso
            const result = await this.db.execute({
                sql: 'SELECT * FROM Recipes WHERE userId = ? ORDER BY createdAt DESC',
                args: [userId]
            });
            recipes = result.rows.map(r => this.parseRecipe(r));
        }

        // 🚀 OPTIMIZATION: Batch-expand all ingredients and preparations
        // Collect all unique ingredient and preparation IDs
        const allIngredientIds = new Set();
        const allPreparationIds = new Set();

        for (const recipe of recipes) {
            // Collect ingredient IDs from baseIngredients, toppingsDuringBake, toppingsPostBake
            [recipe.baseIngredients, recipe.toppingsDuringBake, recipe.toppingsPostBake].forEach(ingList => {
                if (ingList && Array.isArray(ingList)) {
                    ingList.forEach(ing => {
                        if (ing.ingredientId && !ing.name) {
                            allIngredientIds.add(ing.ingredientId);
                        }
                    });
                }
            });

            // Collect preparation IDs
            if (recipe.preparations && Array.isArray(recipe.preparations)) {
                recipe.preparations.forEach(prep => {
                    if ((prep.preparationId || prep.id) && !prep.name) {
                        allPreparationIds.add(prep.preparationId || prep.id);
                    }
                });
            }
        }

        // Batch fetch all ingredients in one query
        let ingredientsMap = new Map();
        if (allIngredientIds.size > 0) {
            const idsArray = Array.from(allIngredientIds);
            const fetchedIngredients = await this.batchFetchIngredients(idsArray, userId);
            fetchedIngredients.forEach(ing => {
                ingredientsMap.set(ing.id, {
                    name: ing.name,
                    category: ing.categoryName,
                    categoryIcon: ing.categoryIcon,
                    defaultUnit: ing.defaultUnit
                });
            });
        }

        // Batch fetch all preparations in one query
        let preparationsMap = new Map();
        if (allPreparationIds.size > 0) {
            const idsArray = Array.from(allPreparationIds);
            const fetchedPreparations = await this.batchFetchPreparations(idsArray, userId);
            fetchedPreparations.forEach(prep => {
                preparationsMap.set(prep.id, {
                    name: prep.name,
                    category: prep.category,
                    description: prep.description
                });
            });
        }

        // Expand data for all recipes
        for (const recipe of recipes) {
            recipe.baseIngredients = this.expandIngredientsFromMap(recipe.baseIngredients || [], ingredientsMap);
            recipe.toppingsDuringBake = this.expandIngredientsFromMap(recipe.toppingsDuringBake || [], ingredientsMap);
            recipe.toppingsPostBake = this.expandIngredientsFromMap(recipe.toppingsPostBake || [], ingredientsMap);
            recipe.preparations = this.expandPreparationsFromMap(recipe.preparations || [], preparationsMap);
        }

        return recipes;
    }

    async getRecipeById(id, userId) {
        let recipe;
        if (this.isSQLite) {
            // If userId is null, fetch without filtering (public access for guests)
            const sql = userId
                ? 'SELECT * FROM Recipes WHERE id = ? AND userId = ?'
                : 'SELECT * FROM Recipes WHERE id = ?';
            const stmt = this.db.prepare(sql);
            recipe = userId
                ? this.parseRecipe(stmt.get(id, userId))
                : this.parseRecipe(stmt.get(id));
        } else {
            // Turso
            const sql = userId
                ? 'SELECT * FROM Recipes WHERE id = ? AND userId = ?'
                : 'SELECT * FROM Recipes WHERE id = ?';
            const args = userId ? [id, userId] : [id];
            const result = await this.db.execute({ sql, args });
            recipe = this.parseRecipe(result.rows[0]);
        }

        if (!recipe) return null;

        // For guest access (userId = null), use the recipe owner's userId to expand ingredients and preparations
        // This ensures user-specific ingredients and preparations are properly fetched
        const expansionUserId = userId || recipe.userId;

        // Expand ingredients and preparations
        recipe.baseIngredients = await this.expandIngredients(recipe.baseIngredients || [], expansionUserId);
        recipe.toppingsDuringBake = await this.expandIngredients(recipe.toppingsDuringBake || [], expansionUserId);
        recipe.toppingsPostBake = await this.expandIngredients(recipe.toppingsPostBake || [], expansionUserId);
        recipe.preparations = await this.expandPreparations(recipe.preparations || [], expansionUserId);

        return recipe;
    }

    async createRecipe(recipe, userId) {
        // Strip embedded data to maintain normalization
        const cleanedBaseIngredients = this.stripEmbeddedIngredientData(recipe.baseIngredients || []);
        const cleanedToppingsDuring = this.stripEmbeddedIngredientData(recipe.toppingsDuringBake || []);
        const cleanedToppingsPost = this.stripEmbeddedIngredientData(recipe.toppingsPostBake || []);
        const cleanedPreparations = this.stripEmbeddedPreparationData(recipe.preparations || []);

        const baseIngredientsJson = JSON.stringify(cleanedBaseIngredients);
        const toppingsDuringJson = JSON.stringify(cleanedToppingsDuring);
        const toppingsPostJson = JSON.stringify(cleanedToppingsPost);
        const preparationsJson = JSON.stringify(cleanedPreparations);
        const instructionsJson = JSON.stringify(recipe.instructions || []);
        const tagsJson = JSON.stringify(recipe.tags || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                INSERT INTO Recipes (id, name, pizzaiolo, source, description, baseIngredients, toppingsDuringBake, toppingsPostBake, preparations, instructions, imageUrl, dough, suggestedDough, archetype, recipeSource, archetypeUsed, createdAt, dateAdded, isFavorite, rating, tags, userId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                recipe.id,
                recipe.name,
                recipe.pizzaiolo || 'Sconosciuto',
                recipe.source || '',
                recipe.description || '',
                baseIngredientsJson,
                toppingsDuringJson,
                toppingsPostJson,
                preparationsJson,
                instructionsJson,
                recipe.imageUrl || '',
                recipe.dough || '',
                recipe.suggestedDough || '',
                recipe.archetype || '',
                recipe.recipeSource || null,
                recipe.archetypeUsed || null,
                recipe.createdAt || Date.now(),
                recipe.dateAdded || Date.now(),
                recipe.isFavorite ? 1 : 0,
                recipe.rating || 0,
                tagsJson,
                userId
            );
        } else {
            // Turso
            await this.db.execute({
                sql: `INSERT INTO Recipes (id, name, pizzaiolo, source, description, baseIngredients, toppingsDuringBake, toppingsPostBake, preparations, instructions, imageUrl, dough, suggestedDough, archetype, recipeSource, archetypeUsed, createdAt, dateAdded, isFavorite, rating, tags, userId)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    recipe.id,
                    recipe.name,
                    recipe.pizzaiolo || 'Sconosciuto',
                    recipe.source || '',
                    recipe.description || '',
                    baseIngredientsJson,
                    toppingsDuringJson,
                    toppingsPostJson,
                    preparationsJson,
                    instructionsJson,
                    recipe.imageUrl || '',
                    recipe.dough || '',
                    recipe.suggestedDough || '',
                    recipe.archetype || '',
                    recipe.recipeSource || null,
                    recipe.archetypeUsed || null,
                    recipe.createdAt || Date.now(),
                    recipe.dateAdded || Date.now(),
                    recipe.isFavorite ? 1 : 0,
                    recipe.rating || 0,
                    tagsJson,
                    userId
                ]
            });
        }
        return recipe;
    }

    async updateRecipe(id, updates, userId) {
        // First, fetch the current recipe to merge with updates
        const currentRecipe = await this.getRecipeById(id, userId);
        if (!currentRecipe) {
            throw new Error(`Recipe with id ${id} not found`);
        }

        // Merge updates with current recipe
        const recipe = { ...currentRecipe, ...updates };

        // Strip embedded data to maintain normalization
        const cleanedBaseIngredients = this.stripEmbeddedIngredientData(recipe.baseIngredients || []);
        const cleanedToppingsDuring = this.stripEmbeddedIngredientData(recipe.toppingsDuringBake || []);
        const cleanedToppingsPost = this.stripEmbeddedIngredientData(recipe.toppingsPostBake || []);
        const cleanedPreparations = this.stripEmbeddedPreparationData(recipe.preparations || []);

        const baseIngredientsJson = JSON.stringify(cleanedBaseIngredients);
        const toppingsDuringJson = JSON.stringify(cleanedToppingsDuring);
        const toppingsPostJson = JSON.stringify(cleanedToppingsPost);
        const preparationsJson = JSON.stringify(cleanedPreparations);
        const instructionsJson = JSON.stringify(recipe.instructions || []);
        const tagsJson = JSON.stringify(recipe.tags || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                UPDATE Recipes 
                SET name=?, pizzaiolo=?, source=?, description=?, baseIngredients=?, toppingsDuringBake=?, toppingsPostBake=?, preparations=?, instructions=?, 
                    imageUrl=?, dough=?, suggestedDough=?, archetype=?, recipeSource=?, archetypeUsed=?, isFavorite=?, rating=?, tags=?
                WHERE id = ? AND userId = ?
            `);
            stmt.run(
                recipe.name,
                recipe.pizzaiolo || 'Sconosciuto',
                recipe.source || '',
                recipe.description || '',
                baseIngredientsJson,
                toppingsDuringJson,
                toppingsPostJson,
                preparationsJson,
                instructionsJson,
                recipe.imageUrl || '',
                recipe.dough || '',
                recipe.suggestedDough || '',
                recipe.archetype || '',
                recipe.recipeSource || null,
                recipe.archetypeUsed || null,
                recipe.isFavorite ? 1 : 0,
                recipe.rating || 0,
                tagsJson,
                id,
                userId
            );
        } else {
            await this.db.execute({
                sql: `UPDATE Recipes SET name=?, pizzaiolo=?, source=?, description=?, baseIngredients=?, toppingsDuringBake=?, toppingsPostBake=?, preparations=?, instructions=?, imageUrl=?, dough=?, suggestedDough=?, archetype=?, recipeSource=?, archetypeUsed=?, isFavorite=?, rating=?, tags=? WHERE id = ? AND userId = ?`,
                args: [recipe.name, recipe.pizzaiolo || 'Sconosciuto', recipe.source || '', recipe.description || '', baseIngredientsJson, toppingsDuringJson, toppingsPostJson, preparationsJson, instructionsJson, recipe.imageUrl || '', recipe.dough || '', recipe.suggestedDough || '', recipe.archetype || '', recipe.recipeSource || null, recipe.archetypeUsed || null, recipe.isFavorite ? 1 : 0, recipe.rating || 0, tagsJson, id, userId]
            });
        }
        return recipe;
    }

    async deleteRecipe(id, userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('DELETE FROM Recipes WHERE id = ? AND userId = ?');
            stmt.run(id, userId);
        } else {
            await this.db.execute({ sql: 'DELETE FROM Recipes WHERE id = ? AND userId = ?', args: [id, userId] });
        }
    }

    // ==========================================
    // PIZZA NIGHTS
    // ==========================================

    async getAllPizzaNights(userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM PizzaNights WHERE userId = ? ORDER BY date DESC');
            return stmt.all(userId).map(r => this.parsePizzaNight(r));
        } else {
            const result = await this.db.execute({
                sql: 'SELECT * FROM PizzaNights WHERE userId = ? ORDER BY date DESC',
                args: [userId]
            });
            return result.rows.map(r => this.parsePizzaNight(r));
        }
    }

    async getPizzaNightById(id, userId) {
        let pizzaNight;
        if (this.isSQLite) {
            // If userId is null, fetch without filtering (public access for guests)
            const sql = userId
                ? 'SELECT * FROM PizzaNights WHERE id = ? AND userId = ?'
                : 'SELECT * FROM PizzaNights WHERE id = ?';
            const stmt = this.db.prepare(sql);
            pizzaNight = userId
                ? this.parsePizzaNight(stmt.get(id, userId))
                : this.parsePizzaNight(stmt.get(id));
        } else {
            // Turso
            const sql = userId
                ? 'SELECT * FROM PizzaNights WHERE id = ? AND userId = ?'
                : 'SELECT * FROM PizzaNights WHERE id = ?';
            const args = userId ? [id, userId] : [id];
            const result = await this.db.execute({ sql, args });
            if (result.rows && result.rows.length > 0) {
                pizzaNight = this.parsePizzaNight(result.rows[0]);
            }
        }

        if (!pizzaNight) return null;

        // Resolve selectedGuests IDs to full guest objects
        pizzaNight.guests = [];
        if (pizzaNight.selectedGuests && pizzaNight.selectedGuests.length > 0) {
            // Use the pizza night's userId to fetch guests (not the passed userId which might be null)
            const guestUserId = pizzaNight.userId;
            for (const guestId of pizzaNight.selectedGuests) {
                try {
                    const guest = await this.getGuestById(guestId, guestUserId);
                    pizzaNight.guests.push(guest || { id: guestId, name: 'Unknown' });
                } catch (err) {
                    console.warn(`Could not resolve guest ${guestId}:`, err.message);
                    pizzaNight.guests.push({ id: guestId, name: 'Unknown' });
                }
            }
        }

        return pizzaNight;
    }

    async createPizzaNight(night, userId) {
        const selectedPizzasJson = JSON.stringify(night.selectedPizzas || []);
        const selectedGuestsJson = JSON.stringify(night.selectedGuests || []);
        const availableIngredientsJson = JSON.stringify(night.availableIngredients || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                INSERT INTO PizzaNights (id, name, date, guestCount, selectedDough, availableIngredients, selectedPizzas, selectedGuests, notes, serviceOrder, status, createdAt, imageUrl, userId, isVotingOpen)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                night.id,
                night.name,
                night.date,
                night.guestCount,
                night.selectedDough || null,
                availableIngredientsJson,
                selectedPizzasJson,
                selectedGuestsJson,
                night.notes || '',
                night.serviceOrder || '',
                night.status,
                night.createdAt,
                night.imageUrl || '',
                userId,
                night.isVotingOpen ? 1 : 0
            );
        } else {
            await this.db.execute({
                sql: `INSERT INTO PizzaNights (id, name, date, guestCount, selectedDough, availableIngredients, selectedPizzas, selectedGuests, notes, serviceOrder, status, createdAt, imageUrl, userId, isVotingOpen)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    night.id,
                    night.name,
                    night.date,
                    night.guestCount,
                    night.selectedDough || null,
                    availableIngredientsJson,
                    selectedPizzasJson,
                    selectedGuestsJson,
                    night.notes || '',
                    night.serviceOrder || '',
                    night.status,
                    night.createdAt,
                    night.imageUrl || '',
                    userId,
                    night.isVotingOpen ? 1 : 0
                ]
            });
        }
        return night;
    }

    async updatePizzaNight(id, updates, userId) {
        console.log(`💾 [DB-ADAPTER] Updating pizza night ${id} with:`, JSON.stringify(updates, null, 2));
        // Fetch current night to merge with updates
        const currentNight = await this.getPizzaNightById(id, userId);
        if (!currentNight) {
            throw new Error(`Pizza night with id ${id} not found`);
        }

        const night = { ...currentNight, ...updates };

        const selectedPizzasJson = JSON.stringify(night.selectedPizzas || []);
        const selectedGuestsJson = JSON.stringify(night.selectedGuests || []);
        const availableIngredientsJson = JSON.stringify(night.availableIngredients || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                UPDATE PizzaNights 
                SET name=?, date=?, guestCount=?, selectedDough=?, availableIngredients=?, selectedPizzas=?, selectedGuests=?, notes=?, serviceOrder=?, status=?, imageUrl=?, isVotingOpen=?
                WHERE id=? AND userId=?
            `);
            stmt.run(
                night.name,
                night.date,
                night.guestCount,
                night.selectedDough || null,
                availableIngredientsJson,
                selectedPizzasJson,
                selectedGuestsJson,
                night.notes || '',
                night.serviceOrder || '',
                night.status,
                night.imageUrl || '',
                night.isVotingOpen ? 1 : 0,
                id,
                userId
            );
        } else {
            await this.db.execute({
                sql: `UPDATE PizzaNights 
                      SET name=?, date=?, guestCount=?, selectedDough=?, availableIngredients=?, 
                          selectedPizzas=?, selectedGuests=?, notes=?, serviceOrder=?, status=?, imageUrl=?, isVotingOpen=?
                      WHERE id=? AND userId=?`,
                args: [
                    night.name,
                    night.date,
                    night.guestCount,
                    night.selectedDough || null,
                    availableIngredientsJson,
                    selectedPizzasJson,
                    selectedGuestsJson,
                    night.notes || '',
                    night.serviceOrder || '',
                    night.status,
                    night.imageUrl || '',
                    night.isVotingOpen ? 1 : 0,
                    id,
                    userId
                ]
            });
        }
        return night;
    }

    async ratePizzaInNight(nightId, recipeId, rating, userId) {
        const night = await this.getPizzaNightById(nightId, userId);
        if (!night) throw new Error('Pizza night not found');

        const pizzas = night.selectedPizzas || [];
        const pizza = pizzas.find(p => (p.recipeId || p.id) === recipeId);

        if (!pizza) throw new Error('Pizza not found in this night');

        if (!pizza.ratings) pizza.ratings = [];
        pizza.ratings.push(Number(rating));

        const updatedNight = await this.updatePizzaNight(nightId, { selectedPizzas: pizzas }, userId);

        // Sync global rating for the recipe
        await this.syncRecipeRating(recipeId, userId);

        return updatedNight;
    }

    async syncRecipeRating(recipeId, userId) {
        // Fetch all pizza nights to aggregate ratings
        let allNights;
        if (this.isSQLite) {
            allNights = this.db.prepare('SELECT selectedPizzas FROM PizzaNights WHERE userId = ?').all(userId).map(n => this.parsePizzaNight(n));
        } else {
            const result = await this.db.execute({
                sql: 'SELECT selectedPizzas FROM PizzaNights WHERE userId = ?',
                args: [userId]
            });
            allNights = result.rows.map(n => this.parsePizzaNight(n));
        }

        let totalScore = 0;
        let totalVotes = 0;

        allNights.forEach(night => {
            const pizzas = night.selectedPizzas || [];
            const pizza = pizzas.find(p => (p.recipeId || p.id) === recipeId);
            if (pizza && pizza.ratings && pizza.ratings.length > 0) {
                pizza.ratings.forEach(v => {
                    totalScore += Number(v);
                    totalVotes++;
                });
            }
        });

        const average = totalVotes > 0 ? (totalScore / totalVotes) : 0;

        // Update recipe table with the new average rating
        if (this.isSQLite) {
            this.db.prepare('UPDATE Recipes SET rating = ? WHERE id = ? AND userId = ?').run(average, recipeId, userId);
        } else {
            await this.db.execute({
                sql: 'UPDATE Recipes SET rating = ? WHERE id = ? AND userId = ?',
                args: [average, recipeId, userId]
            });
        }
        return { average, totalVotes };
    }

    async recalculateAllRecipeRatings() {
        // Get all recipes
        const recipes = await this.getAllRecipes();
        const results = [];

        for (const recipe of recipes) {
            const syncResult = await this.syncRecipeRating(recipe.id);
            results.push({ id: recipe.id, name: recipe.name, ...syncResult });
        }

        return results;
    }

    async deletePizzaNight(id, userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('DELETE FROM PizzaNights WHERE id=? AND userId=?');
            stmt.run(id, userId);
        } else {
            await this.db.execute({ sql: 'DELETE FROM PizzaNights WHERE id=? AND userId=?', args: [id, userId] });
        }
    }

    // ==========================================
    // GUESTS
    // ==========================================

    async getAllGuests(userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Guests WHERE userId = ?');
            return stmt.all(userId);
        } else {
            const result = await this.db.execute({
                sql: 'SELECT * FROM Guests WHERE userId = ?',
                args: [userId]
            });
            return result.rows;
        }
    }

    async createGuest(guest, userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('INSERT INTO Guests (id, name, email, phone, createdAt, userId) VALUES (?, ?, ?, ?, ?, ?)');
            stmt.run(guest.id, guest.name, guest.email || null, guest.phone || null, guest.createdAt, userId);
        } else {
            await this.db.execute({
                sql: 'INSERT INTO Guests (id, name, email, phone, createdAt, userId) VALUES (?, ?, ?, ?, ?, ?)',
                args: [guest.id, guest.name, guest.email || null, guest.phone || null, guest.createdAt, userId]
            });
        }
        return guest;
    }

    async updateGuest(id, updates, userId) {
        // Build dynamic UPDATE query based on provided fields
        const allowedFields = ['name', 'email', 'phone'];
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(value || null);
            }
        }

        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }

        values.push(id); // Add id for WHERE clause
        values.push(userId); // Add userId for WHERE clause
        const sql = `UPDATE Guests SET ${fields.join(', ')} WHERE id = ? AND userId = ?`;

        if (this.isSQLite) {
            const stmt = this.db.prepare(sql);
            stmt.run(...values);
        } else {
            await this.db.execute({ sql, args: values });
        }

        return this.getGuestById(id, userId);
    }

    async getGuestById(id, userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Guests WHERE id = ? AND userId = ?');
            return stmt.get(id, userId);
        } else {
            const result = await this.db.execute({
                sql: 'SELECT * FROM Guests WHERE id = ? AND userId = ?',
                args: [id, userId]
            });
            return result.rows[0] || null;
        }
    }

    async deleteGuest(id, userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('DELETE FROM Guests WHERE id=? AND userId=?');
            stmt.run(id, userId);
        } else {
            await this.db.execute({ sql: 'DELETE FROM Guests WHERE id=? AND userId=?', args: [id, userId] });
        }
    }

    // ==========================================
    // COMBINATIONS
    // ==========================================

    async getAllCombinations(userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Combinations WHERE userId = ?');
            return stmt.all(userId).map(r => this.parseCombination(r));
        } else {
            const result = await this.db.execute({
                sql: 'SELECT * FROM Combinations WHERE userId = ?',
                args: [userId]
            });
            return result.rows.map(r => this.parseCombination(r));
        }
    }

    async createCombination(combo, userId) {
        const ingredientsJson = JSON.stringify(combo.ingredients || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare('INSERT INTO Combinations (id, ingredients, createdAt, userId) VALUES (?, ?, ?, ?)');
            stmt.run(combo.id, ingredientsJson, combo.createdAt, userId);
        } else {
            await this.db.execute({
                sql: 'INSERT INTO Combinations (id, ingredients, createdAt, userId) VALUES (?, ?, ?, ?)',
                args: [combo.id, ingredientsJson, combo.createdAt, userId]
            });
        }
        return combo;
    }

    async deleteCombination(id, userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('DELETE FROM Combinations WHERE id=? AND userId=?');
            stmt.run(id, userId);
        } else {
            await this.db.execute({ sql: 'DELETE FROM Combinations WHERE id=? AND userId=?', args: [id, userId] });
        }
    }

    // ==========================================
    // PREPARATIONS
    // ==========================================

    parsePreparation(record) {
        if (!record) return null;
        return {
            ...record,
            ingredients: typeof record.ingredients === 'string' ? JSON.parse(record.ingredients || '[]') : record.ingredients,
            instructions: typeof record.instructions === 'string' ? JSON.parse(record.instructions || '[]') : record.instructions,
            tips: typeof record.tips === 'string' ? JSON.parse(record.tips || '[]') : record.tips,
            isCustom: !!record.isCustom
        };
    }

    async getAllPreparations(userId) {
        let preps;
        if (this.isSQLite) {
            // If userId is null, only get base preparations (userId IS NULL)
            // Otherwise, get both user-specific and base preparations
            const sql = userId === null
                ? 'SELECT * FROM Preparations WHERE userId IS NULL ORDER BY name'
                : 'SELECT * FROM Preparations WHERE (userId = ? OR userId IS NULL) ORDER BY name';
            const stmt = this.db.prepare(sql);
            preps = (userId === null ? stmt.all() : stmt.all(userId)).map(r => this.parsePreparation(r));
        } else {
            // Turso - same logic
            const sql = userId === null
                ? 'SELECT * FROM Preparations WHERE userId IS NULL ORDER BY name'
                : 'SELECT * FROM Preparations WHERE (userId = ? OR userId IS NULL) ORDER BY name';
            const result = userId === null
                ? await this.db.execute({ sql })
                : await this.db.execute({ sql, args: [userId] });
            preps = result.rows.map(r => this.parsePreparation(r));
        }

        // 🚀 OPTIMIZATION: Collect ALL ingredient IDs from ALL preparations
        const allIngredientIds = new Set();
        for (const prep of preps) {
            if (prep.ingredients && prep.ingredients.length > 0) {
                prep.ingredients.forEach(ing => {
                    if (ing.ingredientId && !ing.name) {
                        allIngredientIds.add(ing.ingredientId);
                    }
                });
            }
        }

        // 🚀 Single batch query for ALL ingredients
        let ingredientsMap = new Map();
        if (allIngredientIds.size > 0) {
            const idsArray = Array.from(allIngredientIds);
            const fetchedIngredients = await this.batchFetchIngredients(idsArray, userId);

            fetchedIngredients.forEach(ing => {
                ingredientsMap.set(ing.id, {
                    name: ing.name,
                    category: ing.categoryName,
                    categoryIcon: ing.categoryIcon,
                    defaultUnit: ing.defaultUnit
                });
            });
        }

        // 🚀 Expand ingredients for each preparation using the pre-loaded map
        for (const prep of preps) {
            prep.ingredients = this.expandIngredientsFromMap(prep.ingredients, ingredientsMap);
        }

        return preps;
    }

    // Helper to expand ingredient references - OPTIMIZED for batch queries
    async expandIngredients(ingredients, userId) {
        if (!ingredients || ingredients.length === 0) return [];

        // Collect all ingredient IDs that need to be fetched
        const idsToFetch = [];
        const expandedMap = new Map();

        for (const ing of ingredients) {
            // If it already has a name, it's already expanded
            if (ing.name) {
                continue;
            }
            // Collect IDs that need fetching
            if (ing.ingredientId && !expandedMap.has(ing.ingredientId)) {
                idsToFetch.push(ing.ingredientId);
            }
        }

        // Batch fetch all ingredients in a single query
        if (idsToFetch.length > 0) {
            try {
                let fetchedIngredients;

                if (this.isSQLite) {
                    const placeholders = idsToFetch.map(() => '?').join(',');
                    const stmt = this.db.prepare(`
                        SELECT i.*, c.name as categoryName, c.icon as categoryIcon
                        FROM Ingredients i
                        LEFT JOIN Categories c ON i.categoryId = c.id
                        WHERE i.id IN (${placeholders}) AND (i.userId = ? OR i.userId IS NULL)
                    `);
                    fetchedIngredients = stmt.all(...idsToFetch, userId);
                } else {
                    // Turso - build IN clause with placeholders
                    const placeholders = idsToFetch.map(() => '?').join(',');
                    const result = await this.db.execute({
                        sql: `
                            SELECT i.*, c.name as categoryName, c.icon as categoryIcon
                            FROM Ingredients i
                            LEFT JOIN Categories c ON i.categoryId = c.id
                            WHERE i.id IN (${placeholders}) AND (i.userId = ? OR i.userId IS NULL)
                        `,
                        args: [...idsToFetch, userId]
                    });
                    fetchedIngredients = result.rows;
                }

                // Create a map of id -> ingredient data
                for (const ingredient of fetchedIngredients) {
                    expandedMap.set(ingredient.id, {
                        name: ingredient.name,
                        category: ingredient.categoryName,
                        categoryIcon: ingredient.categoryIcon,
                        defaultUnit: ingredient.defaultUnit
                    });
                }
            } catch (error) {
                console.error('Error batch fetching ingredients:', error);
            }
        }

        // Now build the expanded array
        const expanded = [];
        for (const ing of ingredients) {
            if (ing.name) {
                // Already expanded
                expanded.push(ing);
            } else if (ing.ingredientId) {
                const ingredientData = expandedMap.get(ing.ingredientId);
                if (ingredientData) {
                    expanded.push({
                        ...ing,
                        ...ingredientData
                    });
                } else {
                    console.warn(`Ingredient not found: ${ing.ingredientId}`);
                    expanded.push(ing);
                }
            } else {
                expanded.push(ing);
            }
        }

        return expanded;
    }

    // Helper to batch fetch ingredients by IDs (used by optimized getAllPreparations)
    async batchFetchIngredients(ids, userId) {
        if (ids.length === 0) return [];

        console.log(`🔍 [batchFetchIngredients] Fetching ${ids.length} ingredients for userId=${userId}`);
        console.log(`🔍 [batchFetchIngredients] IDs: ${ids.join(', ')}`);

        if (this.isSQLite) {
            const placeholders = ids.map(() => '?').join(',');
            const stmt = this.db.prepare(`
                SELECT i.*, c.name as categoryName, c.icon as categoryIcon
                FROM Ingredients i
                LEFT JOIN Categories c ON i.categoryId = c.id
                WHERE i.id IN (${placeholders}) AND (i.userId = ? OR i.userId IS NULL)
            `);
            const results = stmt.all(...ids, userId);
            console.log(`🔍 [batchFetchIngredients] Found ${results.length} ingredients`);
            return results;
        } else {
            const placeholders = ids.map(() => '?').join(',');
            const result = await this.db.execute({
                sql: `
                    SELECT i.*, c.name as categoryName, c.icon as categoryIcon
                    FROM Ingredients i
                    LEFT JOIN Categories c ON i.categoryId = c.id
                    WHERE i.id IN (${placeholders}) AND (i.userId = ? OR i.userId IS NULL)
                `,
                args: [...ids, userId]
            });
            console.log(`🔍 [batchFetchIngredients] Found ${result.rows.length} ingredients`);
            if (result.rows.length > 0) {
                console.log(`🔍 [batchFetchIngredients] Sample: ${result.rows[0].name}`);
            }
            return result.rows;
        }
    }

    // Helper to expand ingredients from a pre-loaded map (used by optimized getAllPreparations)
    expandIngredientsFromMap(ingredients, ingredientsMap) {
        if (!ingredients || ingredients.length === 0) return [];

        return ingredients.map(ing => {
            if (ing.name) {
                // Already expanded
                return ing;
            } else if (ing.ingredientId) {
                const ingredientData = ingredientsMap.get(ing.ingredientId);
                if (ingredientData) {
                    return { ...ing, ...ingredientData };
                } else {
                    console.warn(`Ingredient not found: ${ing.ingredientId}`);
                    return ing;
                }
            }
            return ing;
        });
    }

    // Helper to batch fetch preparations by IDs
    async batchFetchPreparations(ids, userId) {
        if (ids.length === 0) return [];

        if (this.isSQLite) {
            const placeholders = ids.map(() => '?').join(',');
            const stmt = this.db.prepare(`
                SELECT * FROM Preparations
                WHERE id IN (${placeholders}) AND (userId = ? OR userId IS NULL)
            `);
            return stmt.all(...ids, userId).map(p => this.parsePreparation(p));
        } else {
            const placeholders = ids.map(() => '?').join(',');
            const result = await this.db.execute({
                sql: `
                    SELECT * FROM Preparations
                    WHERE id IN (${placeholders}) AND (userId = ? OR userId IS NULL)
                `,
                args: [...ids, userId]
            });
            return result.rows.map(p => this.parsePreparation(p));
        }
    }

    // Helper to expand preparations from a pre-loaded map
    expandPreparationsFromMap(preparations, preparationsMap) {
        if (!preparations || preparations.length === 0) return [];

        return preparations.map(prep => {
            if (prep.name) {
                // Already expanded
                return prep;
            } else if (prep.preparationId || prep.id) {
                const prepId = prep.preparationId || prep.id;
                const preparationData = preparationsMap.get(prepId);
                if (preparationData) {
                    return { ...prep, ...preparationData };
                } else {
                    console.warn(`Preparation not found: ${prepId}`);
                    return prep;
                }
            }
            return prep;
        });
    }

    // Helper to expand preparations (non-batch version)
    async expandPreparations(preparations, userId) {
        if (!preparations || preparations.length === 0) return [];

        const idsToFetch = [];
        for (const prep of preparations) {
            if (!prep.name && (prep.preparationId || prep.id)) {
                idsToFetch.push(prep.preparationId || prep.id);
            }
        }

        if (idsToFetch.length === 0) return preparations;

        const fetchedPreparations = await this.batchFetchPreparations(idsToFetch, userId);
        const preparationsMap = new Map();
        fetchedPreparations.forEach(prep => {
            preparationsMap.set(prep.id, {
                name: prep.name,
                category: prep.category,
                description: prep.description
            });
        });

        return this.expandPreparationsFromMap(preparations, preparationsMap);
    }


    async getPreparationById(id, userId) {
        if (this.isSQLite) {
            let sql = 'SELECT * FROM Preparations WHERE id = ?';
            const params = [id];

            if (userId) {
                sql += ' AND (userId = ? OR userId IS NULL)';
                params.push(userId);
            }

            const stmt = this.db.prepare(sql);
            const prep = this.parsePreparation(stmt.get(...params));
            if (prep) {
                prep.ingredients = await this.expandIngredients(prep.ingredients, userId);
            }
            return prep;
        } else {
            // Turso
            let sql = 'SELECT * FROM Preparations WHERE id = ?';
            const args = [id];

            if (userId) {
                sql += ' AND (userId = ? OR userId IS NULL)';
                args.push(userId);
            }

            const result = await this.db.execute({ sql, args });
            const prep = this.parsePreparation(result.rows[0]);
            if (prep) {
                prep.ingredients = await this.expandIngredients(prep.ingredients, userId);
            }
            return prep;
        }
    }

    async createPreparation(prep, userId) {
        // Strip embedded ingredient data to maintain normalization
        const cleanedIngredients = this.stripEmbeddedIngredientData(prep.ingredients || []);
        const ingredientsJson = JSON.stringify(cleanedIngredients);
        const instructionsJson = JSON.stringify(prep.instructions || []);
        const tipsJson = JSON.stringify(prep.tips || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                INSERT INTO Preparations (id, name, category, description, yield, prepTime, difficulty, ingredients, instructions, tips, dateAdded, isCustom, recipeUrl, userId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                prep.id,
                prep.name,
                prep.category,
                prep.description || '',
                prep.yield || 4,
                prep.prepTime || '',
                prep.difficulty || 'Media',
                ingredientsJson,
                instructionsJson,
                tipsJson,
                prep.dateAdded || Date.now(),
                prep.isCustom !== undefined ? (prep.isCustom ? 1 : 0) : 1,
                prep.recipeUrl || null,
                userId
            );
        } else {
            await this.db.execute({
                sql: `
                INSERT INTO Preparations (id, name, category, description, [yield], prepTime, difficulty, ingredients, instructions, tips, dateAdded, isCustom, recipeUrl, userId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                args: [
                    prep.id,
                    prep.name,
                    prep.category,
                    prep.description || '',
                    prep.yield || 4,
                    prep.prepTime || '',
                    prep.difficulty || 'Media',
                    ingredientsJson,
                    instructionsJson,
                    tipsJson,
                    prep.dateAdded || Date.now(),
                    prep.isCustom !== undefined ? (prep.isCustom ? 1 : 0) : 1,
                    prep.recipeUrl || null,
                    userId
                ]
            });
        }
        return prep;
    }

    async updatePreparation(id, updates, userId) {
        // Fetch current preparation to merge with updates
        const currentPrep = await this.getPreparationById(id, userId);
        if (!currentPrep) {
            throw new Error(`Preparation with id ${id} not found`);
        }

        const prep = { ...currentPrep, ...updates };

        // Strip embedded ingredient data to maintain normalization
        const cleanedIngredients = this.stripEmbeddedIngredientData(prep.ingredients || []);
        const ingredientsJson = JSON.stringify(cleanedIngredients);
        const instructionsJson = JSON.stringify(prep.instructions || []);
        const tipsJson = JSON.stringify(prep.tips || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                UPDATE Preparations 
                SET name=?, category=?, description=?, yield=?, prepTime=?, difficulty=?, 
                    ingredients=?, instructions=?, tips=?, recipeUrl=?
                WHERE id=? AND userId=?
            `);
            stmt.run(
                prep.name,
                prep.category,
                prep.description || '',
                prep.yield || 4,
                prep.prepTime || '',
                prep.difficulty || 'Media',
                ingredientsJson,
                instructionsJson,
                tipsJson,
                prep.recipeUrl || null,
                id,
                userId
            );
        } else {
            await this.db.execute({
                sql: `
                UPDATE Preparations 
                SET name=?, category=?, description=?, [yield]=?, prepTime=?, difficulty=?, 
                    ingredients=?, instructions=?, tips=?, recipeUrl=?
                WHERE id=? AND userId=?
                `,
                args: [
                    prep.name,
                    prep.category,
                    prep.description || '',
                    prep.yield || 4,
                    prep.prepTime || '',
                    prep.difficulty || 'Media',
                    ingredientsJson,
                    instructionsJson,
                    tipsJson,
                    prep.recipeUrl || null,
                    id,
                    userId
                ]
            });
        }
        return prep;
    }

    async updatePreparationLink(id, url, userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('UPDATE Preparations SET recipeUrl = ? WHERE id = ? AND userId = ?');
            stmt.run(url, id, userId);
        } else {
            await this.db.execute({
                sql: 'UPDATE Preparations SET recipeUrl = ? WHERE id = ? AND userId = ?',
                args: [url, id, userId]
            });
        }
        return this.getPreparationById(id, userId);
    }

    async deletePreparation(id, userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('DELETE FROM Preparations WHERE id=? AND userId=?');
            stmt.run(id, userId);
        } else {
            await this.db.execute({ sql: 'DELETE FROM Preparations WHERE id=? AND userId=?', args: [id, userId] });
        }
    }

    // ==========================================
    // INGREDIENTS
    // ==========================================

    parseIngredient(record) {
        if (!record) return null;

        // Helper to safely parse JSON fields
        const safeParseJSON = (value, fallback = []) => {
            if (!value || value === 'null') return fallback;
            if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    return parsed === null ? fallback : parsed;
                } catch (e) {
                    console.warn('Failed to parse JSON:', value);
                    return fallback;
                }
            }
            return value; // Already parsed
        };

        return {
            ...record,
            season: safeParseJSON(record.season, null),
            allergens: safeParseJSON(record.allergens, []),
            tags: safeParseJSON(record.tags, []),
            postBake: !!record.postBake,
            isCustom: !!record.isCustom
        };
    }

    async getAllIngredients(userId) {
        if (this.isSQLite) {
            // If userId is null, only get base ingredients (userId IS NULL)
            // Otherwise, get both user-specific and base ingredients
            const sql = userId === null
                ? `SELECT i.*, c.name as categoryName, c.icon as categoryIcon
                   FROM Ingredients i
                   LEFT JOIN Categories c ON i.categoryId = c.id
                   WHERE i.userId IS NULL
                   ORDER BY c.displayOrder, i.name`
                : `SELECT i.*, c.name as categoryName, c.icon as categoryIcon
                   FROM Ingredients i
                   LEFT JOIN Categories c ON i.categoryId = c.id
                   WHERE (i.userId = ? OR i.userId IS NULL)
                   ORDER BY c.displayOrder, i.name`;
            const stmt = this.db.prepare(sql);
            return (userId === null ? stmt.all() : stmt.all(userId)).map(r => {
                const parsed = this.parseIngredient(r);
                parsed.category = r.categoryName;
                parsed.categoryIcon = r.categoryIcon;
                return parsed;
            });
        } else {
            // Turso - same logic
            const sql = userId === null
                ? `SELECT i.*, c.name as categoryName, c.icon as categoryIcon
                   FROM Ingredients i
                   LEFT JOIN Categories c ON i.categoryId = c.id
                   WHERE i.userId IS NULL
                   ORDER BY c.displayOrder, i.name`
                : `SELECT i.*, c.name as categoryName, c.icon as categoryIcon
                   FROM Ingredients i
                   LEFT JOIN Categories c ON i.categoryId = c.id
                   WHERE (i.userId = ? OR i.userId IS NULL)
                   ORDER BY c.displayOrder, i.name`;
            const result = userId === null
                ? await this.db.execute({ sql })
                : await this.db.execute({ sql, args: [userId] });
            return result.rows.map(r => {
                const parsed = this.parseIngredient(r);
                parsed.category = r.categoryName;
                parsed.categoryIcon = r.categoryIcon;
                return parsed;
            });
        }
    }

    async getIngredientById(id, userId) {
        if (this.isSQLite) {
            let sql = 'SELECT * FROM Ingredients WHERE id = ?';
            const params = [id];

            if (userId) {
                sql += ' AND (userId = ? OR userId IS NULL)';
                params.push(userId);
            }

            const stmt = this.db.prepare(sql);
            return this.parseIngredient(stmt.get(...params));
        } else {
            // Turso
            let sql = 'SELECT * FROM Ingredients WHERE id = ?';
            const args = [id];

            if (userId) {
                sql += ' AND (userId = ? OR userId IS NULL)';
                args.push(userId);
            }

            const result = await this.db.execute({ sql, args });
            return this.parseIngredient(result.rows[0]);
        }
    }

    async getIngredientsByCategory(category, userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Ingredients WHERE category = ? AND (userId = ? OR userId IS NULL) ORDER BY name');
            return stmt.all(category, userId).map(r => this.parseIngredient(r));
        } else {
            // Turso
            const result = await this.db.execute({ sql: 'SELECT * FROM Ingredients WHERE category = ? AND (userId = ? OR userId IS NULL) ORDER BY name', args: [category, userId] });
            return result.rows.map(r => this.parseIngredient(r));
        }
    }

    async searchIngredients(searchQuery, userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Ingredients WHERE name LIKE ? AND (userId = ? OR userId IS NULL) ORDER BY name');
            return stmt.all(`%${searchQuery}%`, userId).map(r => this.parseIngredient(r));
        } else {
            // Turso
            const result = await this.db.execute({ sql: 'SELECT * FROM Ingredients WHERE name LIKE ? AND (userId = ? OR userId IS NULL) ORDER BY name', args: [`%${searchQuery}%`, userId] });
            return result.rows.map(r => this.parseIngredient(r));
        }
    }

    async createIngredient(ingredient, userId) {
        const seasonJson = ingredient.season ? JSON.stringify(ingredient.season) : null;
        const allergensJson = JSON.stringify(ingredient.allergens || []);
        const tagsJson = JSON.stringify(ingredient.tags || []);

        // Convert category name to categoryId UUID
        let categoryId;
        if (ingredient.categoryId) {
            // Already has categoryId (UUID)
            categoryId = ingredient.categoryId;
        } else if (ingredient.category) {
            // Convert category name to UUID
            categoryId = DatabaseAdapter.CATEGORY_UUID_MAP[ingredient.category];
            if (!categoryId) {
                // Fallback to 'Altro' if category not found
                console.warn(`Category "${ingredient.category}" not found in mapping, using 'Altro'`);
                categoryId = DatabaseAdapter.CATEGORY_UUID_MAP['Altro'];
            }
        } else {
            // No category specified, use 'Altro' as default
            categoryId = DatabaseAdapter.CATEGORY_UUID_MAP['Altro'];
        }

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                INSERT INTO Ingredients (id, name, categoryId, subcategory, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded, userId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                ingredient.id,
                ingredient.name,
                categoryId,  // Use categoryId UUID instead of category name
                ingredient.subcategory || null,
                ingredient.minWeight || null,
                ingredient.maxWeight || null,
                ingredient.defaultUnit || 'g',
                ingredient.postBake ? 1 : 0,
                ingredient.phase || 'topping',
                seasonJson,
                allergensJson,
                tagsJson,
                ingredient.isCustom ? 1 : 0,
                ingredient.dateAdded || Date.now(),
                userId
            );
        } else {
            await this.db.execute(`
                INSERT INTO Ingredients (id, name, categoryId, subcategory, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded, userId)
                VALUES (@id, @name, @categoryId, @subcategory, @minWeight, @maxWeight, @defaultUnit, @postBake, @phase, @season, @allergens, @tags, @isCustom, @dateAdded, @userId)
            `, {
                id: ingredient.id,
                name: ingredient.name,
                categoryId: categoryId,  // Use categoryId UUID instead of category name
                subcategory: ingredient.subcategory || null,
                minWeight: ingredient.minWeight || null,
                maxWeight: ingredient.maxWeight || null,
                defaultUnit: ingredient.defaultUnit || 'g',
                postBake: ingredient.postBake ? 1 : 0,
                phase: ingredient.phase || 'topping',
                season: seasonJson,
                allergens: allergensJson,
                tags: tagsJson,
                isCustom: ingredient.isCustom ? 1 : 0,
                dateAdded: ingredient.dateAdded || Date.now(),
                userId: userId
            });
        }
        return ingredient;
    }

    // Category name to UUID mapping for Turso (which uses categoryId instead of category text)
    static CATEGORY_UUID_MAP = {
        'Erbe e Spezie': '1906de1a-a1ea-4398-99e1-758c47c091c7',
        'Frutta e Frutta Secca': '32b1230e-f71b-4cfd-832c-05c9e411d143',
        'Frutta': '32b1230e-f71b-4cfd-832c-05c9e411d143',  // Alias for Frutta e Frutta Secca
        'Formaggi': '3dbbfdeb-b431-426b-8651-4420c3516631',
        'Pesce e Frutti di Mare': '59c43017-0e9e-4158-b1cb-9f17824aee42',
        'Verdure e Ortaggi': '6d6d0249-55a7-4340-a6bf-419c9326a1f0',
        'Latticini': '80a97e5f-8907-47bc-9d9f-848d38ebb5db',
        'Impasti': 'badfb995-b4f3-4a2a-bcda-fd91e015132a',
        'Altro': 'c0667350-c6b3-406e-9cd2-1208bd3b41fa',
        'Carni e Salumi': 'ca899f64-0f6f-43a0-8d88-821b54be31a4',
        'Basi e Salse': 'e7d1ade0-f3c1-4170-9347-19d6f3b4b1f5'
    };

    async updateIngredient(id, updates, userId) {
        console.log(`[updateIngredient] id: ${id}, updates:`, JSON.stringify(updates));

        // Fetch existing ingredient first
        const existing = await this.getIngredientById(id, userId);
        if (!existing) {
            console.error(`[updateIngredient] Ingredient ${id} not found`);
            throw new Error(`Ingredient with id ${id} not found`);
        }

        console.log(`[updateIngredient] Existing ingredient:`, existing.name);

        // Merge updates with existing data
        const ingredient = { ...existing, ...updates };

        console.log(`[updateIngredient] Merged ingredient category:`, ingredient.category);

        // Helper to safely stringify JSON fields
        const safeStringify = (value, fallback = null) => {
            if (value === null || value === undefined) return fallback;
            if (typeof value === 'string') return value; // Already stringified
            return JSON.stringify(value);
        };

        const seasonJson = safeStringify(ingredient.season, null);
        const allergensJson = safeStringify(ingredient.allergens, JSON.stringify([]));
        const tagsJson = safeStringify(ingredient.tags, JSON.stringify([]));

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                UPDATE Ingredients 
                SET name=?, category=?, subcategory=?, minWeight=?, maxWeight=?, defaultUnit=?, postBake=?, phase=?, season=?, allergens=?, tags=?
                WHERE id = ? AND userId = ?
            `);
            stmt.run(
                ingredient.name,
                ingredient.category,
                ingredient.subcategory || null,
                ingredient.minWeight || null,
                ingredient.maxWeight || null,
                ingredient.defaultUnit || 'g',
                ingredient.postBake ? 1 : 0,
                ingredient.phase || 'topping',
                seasonJson,
                allergensJson,
                tagsJson,
                id,
                userId
            );
        } else {
            // Turso - use positional parameters WITHOUT quotes
            console.log(`[updateIngredient] About to execute Turso UPDATE...`);
            console.log(`[updateIngredient] SQL:`, `UPDATE Ingredients SET name=?, category=?, subcategory=?, minWeight=?, maxWeight=?, defaultUnit=?, postBake=?, phase=?, season=?, allergens=?, tags=? WHERE id=? AND userId=?`);
            console.log(`[updateIngredient] Args:`, [ingredient.name, ingredient.category, ingredient.subcategory, ingredient.minWeight, ingredient.maxWeight, ingredient.defaultUnit, ingredient.postBake, ingredient.phase, 'seasonJson', 'allergensJson', 'tagsJson', id, userId]);

            try {
                // DELETE+INSERT workaround for Turso (uses categoryId UUID instead of category text)
                const categoryUuid = DatabaseAdapter.CATEGORY_UUID_MAP[ingredient.category] || DatabaseAdapter.CATEGORY_UUID_MAP['Altro'];
                console.log(`[updateIngredient] Converting category "${ingredient.category}" → UUID "${categoryUuid}"`);

                await this.db.execute({
                    sql: 'DELETE FROM Ingredients WHERE id = ? AND userId = ?',
                    args: [id, userId]
                });
                await this.db.execute({
                    sql: `INSERT INTO Ingredients (id, name, categoryId, subcategory, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded, userId)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [
                        id,
                        ingredient.name,
                        categoryUuid, // Use UUID instead of text
                        ingredient.subcategory || null,
                        ingredient.minWeight || null,
                        ingredient.maxWeight || null,
                        ingredient.defaultUnit || 'g',
                        ingredient.postBake ? 1 : 0,
                        ingredient.phase || 'topping',
                        seasonJson,
                        allergensJson,
                        tagsJson,
                        ingredient.isCustom ? 1 : 0,
                        ingredient.dateAdded || Date.now(),
                        userId
                    ]
                });
                console.log(`[updateIngredient] DELETE+INSERT completed successfully`);
            } catch (execError) {
                console.error(`[updateIngredient] Turso UPDATE failed:`, execError);
                throw execError;
            }
        }
        return ingredient;
    }

    async deleteIngredient(id, userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('DELETE FROM Ingredients WHERE id=? AND userId=?');
            stmt.run(id, userId);
        } else {
            await this.db.execute({ sql: 'DELETE FROM Ingredients WHERE id=? AND userId=?', args: [id, userId] });
        }
    }


    // ==========================================
    // CATEGORIES
    // ==========================================

    async getAllCategories() {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Categories ORDER BY displayOrder');
            return stmt.all();
        } else {
            // Turso (LibSQL)
            const result = await this.db.execute('SELECT * FROM Categories ORDER BY displayOrder');
            return result.rows;
        }
    }

    async getCategoryById(id) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Categories WHERE id = ?');
            return stmt.get(id);
        } else {
            // Turso (LibSQL)
            const result = await this.db.execute({ sql: 'SELECT * FROM Categories WHERE id = ?', args: [id] });
            return result.rows[0];
        }
    }

    // ==========================================
    // ARCHETYPE WEIGHTS
    // ==========================================

    async getArchetypeWeights(userId = 'default') {
        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                SELECT archetype, weight, description
                FROM ArchetypeWeights
                WHERE userId = ?
                ORDER BY weight DESC
            `);
            return stmt.all(userId);
        } else {
            // Turso
            const result = await this.db.execute({
                sql: `SELECT archetype, weight, description
                      FROM ArchetypeWeights
                      WHERE userId = ?
                      ORDER BY weight DESC`,
                args: [userId]
            });
            return result.rows;
        }
    }

    async updateArchetypeWeight(userId = 'default', archetype, weight) {
        const id = `aw-${userId}-${archetype}`;
        const now = Date.now();

        if (this.isSQLite) {
            this.db.prepare(`
                INSERT INTO ArchetypeWeights (id, userId, archetype, weight, dateModified)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(userId, archetype) DO UPDATE SET
                    weight = excluded.weight,
                    dateModified = excluded.dateModified
            `).run(id, userId, archetype, weight, now);
            return { success: true };
        } else {
            // Turso - Use INSERT OR REPLACE
            await this.db.execute({
                sql: `INSERT OR REPLACE INTO ArchetypeWeights (id, userId, archetype, weight, dateModified)
                      VALUES (?, ?, ?, ?, ?)`,
                args: [id, userId, archetype, weight, now]
            });
            return { success: true };
        }
    }

    async resetArchetypeWeights(userId = 'default') {
        const DEFAULT_WEIGHTS = [
            { archetype: 'combinazioni_db', weight: 30, description: 'Combinazioni salvate nel database' },
            { archetype: 'classica', weight: 28, description: 'Margherita, Marinara style' },
            { archetype: 'tradizionale', weight: 21, description: 'Prosciutto, Funghi, Capricciosa' },
            { archetype: 'terra_bosco', weight: 7, description: 'Funghi porcini, tartufo' },
            { archetype: 'fresca_estiva', weight: 7, description: 'Verdure, pomodorini' },
            { archetype: 'piccante_decisa', weight: 4, description: 'Nduja, peperoncino' },
            { archetype: 'mare', weight: 2, description: 'Pesce, frutti di mare' },
            { archetype: 'vegana', weight: 1, description: 'Solo vegetali' }
        ];

        const now = Date.now();

        if (this.isSQLite) {
            // Delete existing weights for user
            this.db.prepare('DELETE FROM ArchetypeWeights WHERE userId = ?').run(userId);

            // Insert defaults
            const stmt = this.db.prepare(`
                INSERT INTO ArchetypeWeights (id, userId, archetype, weight, description, dateModified)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            DEFAULT_WEIGHTS.forEach(w => {
                const id = `aw-${userId}-${w.archetype}`;
                stmt.run(id, userId, w.archetype, w.weight, w.description, now);
            });

            return { success: true, count: DEFAULT_WEIGHTS.length };
        } else {
            // Turso - Delete and insert
            await this.db.execute({
                sql: 'DELETE FROM ArchetypeWeights WHERE userId = ?',
                args: [userId]
            });

            // Insert all defaults
            for (const w of DEFAULT_WEIGHTS) {
                const id = `aw-${userId}-${w.archetype}`;
                await this.db.execute({
                    sql: `INSERT INTO ArchetypeWeights (id, userId, archetype, weight, description, dateModified)
                          VALUES (?, ?, ?, ?, ?, ?)`,
                    args: [id, userId, w.archetype, w.weight, w.description, now]
                });
            }

            return { success: true, count: DEFAULT_WEIGHTS.length };
        }
    }

    // ==========================================
    // USERS & AUTHENTICATION
    // ==========================================

    async createUser(userData) {
        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                INSERT INTO Users (id, email, password, name, businessName, createdAt, lastLogin)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                userData.id,
                userData.email,
                userData.password,
                userData.name,
                userData.businessName,
                userData.createdAt,
                userData.lastLogin
            );
        } else {
            await this.db.execute({
                sql: `INSERT INTO Users (id, email, password, name, businessName, createdAt, lastLogin)
                      VALUES (?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    userData.id,
                    userData.email,
                    userData.password,
                    userData.name,
                    userData.businessName,
                    userData.createdAt,
                    userData.lastLogin
                ]
            });
        }

        // Return user without password
        const { password, ...userWithoutPassword } = userData;
        return userWithoutPassword;
    }

    async getUserByEmail(email) {
        console.log('🔍 DB DEBUG: Fetching user by email:', email);
        const sql = 'SELECT id, email, password, name, businessName, role, createdAt, lastLogin FROM Users WHERE email = ?';

        try {
            if (this.isSQLite) {
                const stmt = this.db.prepare(sql);
                const user = stmt.get(email);
                console.log('🔍 DB DEBUG: SQLite User result:', user ? `Found (Role: ${user.role})` : 'Not found');
                return user;
            } else {
                // Turso
                const result = await this.db.execute({
                    sql: sql,
                    args: [email]
                });
                const user = result.rows[0] || null;
                console.log('🔍 DB DEBUG: Turso User result:', user ? `Found (Role: ${user.role})` : 'Not found');
                return user;
            }
        } catch (err) {
            console.error('❌ DB DEBUG: getUserByEmail error:', err);
            throw err;
        }
    }

    async getUserById(id) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Users WHERE id = ?');
            return stmt.get(id);
        } else {
            const result = await this.db.execute({
                sql: 'SELECT * FROM Users WHERE id = ?',
                args: [id]
            });
            return result.rows[0] || null;
        }
    }

    async updateUserLastLogin(id) {
        const now = Date.now();
        if (this.isSQLite) {
            const stmt = this.db.prepare('UPDATE Users SET lastLogin = ? WHERE id = ?');
            stmt.run(now, id);
        } else {
            await this.db.execute({
                sql: 'UPDATE Users SET lastLogin = ? WHERE id = ?',
                args: [now, id]
            });
        }
    }

    async updateUser(id, updates) {
        const allowedFields = ['name', 'businessName', 'password'];
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }

        values.push(id);
        const sql = `UPDATE Users SET ${fields.join(', ')} WHERE id = ?`;

        if (this.isSQLite) {
            const stmt = this.db.prepare(sql);
            stmt.run(...values);
        } else {
            await this.db.execute({ sql, args: values });
        }

        return this.getUserById(id);
    }

    async updateUserRole(email, role) {
        console.log(`🔐 [DB] Promoting user ${email} to role: ${role}`);
        const sql = 'UPDATE Users SET role = ? WHERE email = ?';

        if (this.isSQLite) {
            const stmt = this.db.prepare(sql);
            const info = stmt.run(role, email);
            return info.changes > 0;
        } else {
            const result = await this.db.execute({
                sql: sql,
                args: [role, email]
            });
            return result.rowsAffected > 0;
        }
    }

    async updateUserRoleById(id, role) {
        console.log(`🔐 [DB] Updating user ID ${id} to role: ${role}`);
        const sql = 'UPDATE Users SET role = ? WHERE id = ?';

        if (this.isSQLite) {
            const stmt = this.db.prepare(sql);
            const info = stmt.run(role, id);
            return info.changes > 0;
        } else {
            const result = await this.db.execute({
                sql: sql,
                args: [role, id]
            });
            return result.rowsAffected > 0;
        }
    }

    async setUserResetToken(email, token, expires) {
        console.log(`🔐 [DB] Setting reset token for ${email}`);
        const sql = 'UPDATE Users SET resetToken = ?, resetExpires = ? WHERE email = ?';

        if (this.isSQLite) {
            const stmt = this.db.prepare(sql);
            const info = stmt.run(token, expires, email);
            return info.changes > 0;
        } else {
            const result = await this.db.execute({
                sql: sql,
                args: [token, expires, email]
            });
            return result.rowsAffected > 0;
        }
    }

    async getUserByResetToken(token) {
        const sql = 'SELECT * FROM Users WHERE resetToken = ?';

        if (this.isSQLite) {
            const record = this.db.prepare(sql).get(token);
            return record || null;
        } else {
            const result = await this.db.execute({
                sql: sql,
                args: [token]
            });
            return result.rows.length > 0 ? result.rows[0] : null;
        }
    }

    async clearUserResetToken(userId) {
        console.log(`🔐 [DB] Clearing reset token for user ${userId}`);
        const sql = 'UPDATE Users SET resetToken = NULL, resetExpires = NULL WHERE id = ?';

        if (this.isSQLite) {
            const stmt = this.db.prepare(sql);
            const info = stmt.run(userId);
            return info.changes > 0;
        } else {
            const result = await this.db.execute({
                sql: sql,
                args: [userId]
            });
            return result.rowsAffected > 0;
        }
    }

    async createUserSettings(userId) {
        const settingsId = 'settings-' + userId;
        const defaultSettings = {
            id: settingsId,
            userId,
            bringEmail: null,
            bringPassword: null,
            geminiModel: 'gemini-1.5-flash',
            maxOvenTemp: 250,
            geminiApiKey: null,
            segmindApiKey: null,
            defaultDough: null,
            hasSeenOnboarding: 0,
            preferences: '{}'
        };

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                    INSERT INTO Settings (id, userId, bringEmail, bringPassword, geminiModel, maxOvenTemp, geminiApiKey, segmindApiKey, defaultDough, hasSeenOnboarding, preferences)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
            stmt.run(
                defaultSettings.id,
                defaultSettings.userId,
                defaultSettings.bringEmail,
                defaultSettings.bringPassword,
                defaultSettings.geminiModel,
                defaultSettings.maxOvenTemp,
                defaultSettings.geminiApiKey,
                defaultSettings.segmindApiKey,
                defaultSettings.defaultDough,
                defaultSettings.hasSeenOnboarding,
                defaultSettings.preferences
            );
        } else {
            await this.db.execute({
                sql: `INSERT INTO Settings (id, userId, bringEmail, bringPassword, geminiModel, maxOvenTemp, geminiApiKey, segmindApiKey, defaultDough, hasSeenOnboarding, preferences)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    defaultSettings.id,
                    defaultSettings.userId,
                    defaultSettings.bringEmail,
                    defaultSettings.bringPassword,
                    defaultSettings.geminiModel,
                    defaultSettings.maxOvenTemp,
                    defaultSettings.geminiApiKey,
                    defaultSettings.segmindApiKey,
                    defaultSettings.defaultDough,
                    defaultSettings.hasSeenOnboarding,
                    defaultSettings.preferences
                ]
            });
        }

        return defaultSettings;
    }

    async getUserSettings(userId) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Settings WHERE userId = ?');
            const settings = stmt.get(userId);
            if (settings && settings.preferences) {
                settings.preferences = JSON.parse(settings.preferences);
            }
            return settings;
        } else {
            const result = await this.db.execute({
                sql: 'SELECT * FROM Settings WHERE userId = ?',
                args: [userId]
            });
            const settings = result.rows[0] || null;
            if (settings && settings.preferences) {
                settings.preferences = JSON.parse(settings.preferences);
            }
            return settings;
        }
    }

    async updateUserSettings(userId, updates) {
        // First, check if settings exist for this user
        let existing = await this.getUserSettings(userId);

        // If no settings exist, create them first
        if (!existing) {
            console.log(`📝 Creating new settings record for user ${userId}`);
            existing = await this.createUserSettings(userId);
        }

        const allowedFields = ['bringEmail', 'bringPassword', 'geminiModel', 'maxOvenTemp', 'geminiApiKey', 'segmindApiKey', 'defaultDough', 'hasSeenOnboarding', 'preferences'];
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                // Stringify preferences if it's an object
                values.push(key === 'preferences' && typeof value === 'object' ? JSON.stringify(value) : value);
            }
        }

        if (fields.length === 0) {
            throw new Error('No valid fields to update');
        }

        values.push(userId);
        const sql = `UPDATE Settings SET ${fields.join(', ')} WHERE userId = ?`;

        if (this.isSQLite) {
            const stmt = this.db.prepare(sql);
            stmt.run(...values);
        } else {
            await this.db.execute({ sql, args: values });
        }

        return this.getUserSettings(userId);
    }

    async deleteUserWithData(userId) {
        console.log(`🗑️ [DB] Performing full data cleanup for user: ${userId}`);

        const tables = [
            'Settings',
            'Recipes',
            'PizzaNights',
            'Guests',
            'Combinations',
            'Preparations',
            'Ingredients',
            'Categories',
            'ArchetypeWeights'
        ];

        if (this.isSQLite) {
            // Use a transaction for SQLite
            const deleteTx = this.db.transaction((id) => {
                for (const table of tables) {
                    this.db.prepare(`DELETE FROM ${table} WHERE userId = ?`).run(id);
                }
                this.db.prepare('DELETE FROM Users WHERE id = ?').run(id);
            });
            deleteTx(userId);
        } else {
            // Turso - use batch for atomicity
            const batch = tables.map(table => ({
                sql: `DELETE FROM ${table} WHERE userId = ?`,
                args: [userId]
            }));
            batch.push({
                sql: 'DELETE FROM Users WHERE id = ?',
                args: [userId]
            });
            await this.db.batch(batch, "write");
        }

        console.log(`✅ Full cleanup completed for user: ${userId}`);
        return { success: true };
    }

    async initializeUserDefaults(userId) {
        // This method is called when a new user registers
        // It seeds base categories, ingredients, preparations and archetype weights for the new user
        try {
            console.log(`🌱 Initializing defaults for user ${userId}...`);

            // 1. Seed global base data (categories, ingredients, preparations)
            //    Seed is idempotente: se i dati base esistono già, non vengono duplicati
            const { seedAll } = await import('./seed-service.js');
            const seedResults = await seedAll();

            // 2. Copy base preparations for the new user (if they don't already have them)
            await this.copyBasePreparationsForUser(userId);

            // 3. Initialize archetype weights for this specific user
            const archetypeWeightsResult = await this.resetArchetypeWeights(userId);

            const combined = {
                ...seedResults,
                archetypeWeights: archetypeWeightsResult
            };

            console.log(`✅ Initialized defaults for user ${userId}:`, combined);
            return combined;
        } catch (error) {
            console.error(`❌ Failed to initialize defaults for user ${userId}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Copy base preparations (with userId IS NULL) for a new user
     * This ensures every user has their own copy of base preparations
     */
    async copyBasePreparationsForUser(userId) {
        try {
            console.log(`📋 Copying base preparations for user ${userId}...`);
            
            // Get all base preparations (userId IS NULL)
            let basePreparations;
            if (this.isSQLite) {
                const stmt = this.db.prepare('SELECT * FROM Preparations WHERE userId IS NULL');
                basePreparations = stmt.all().map(p => this.parsePreparation(p));
            } else {
                const result = await this.db.execute({
                    sql: 'SELECT * FROM Preparations WHERE userId IS NULL',
                    args: []
                });
                basePreparations = result.rows.map(p => this.parsePreparation(p));
            }

            // Get existing preparations for this user to avoid duplicates
            let userPreparations;
            if (this.isSQLite) {
                const stmt = this.db.prepare('SELECT name FROM Preparations WHERE userId = ?');
                userPreparations = stmt.all(userId);
            } else {
                const result = await this.db.execute({
                    sql: 'SELECT name FROM Preparations WHERE userId = ?',
                    args: [userId]
                });
                userPreparations = result.rows;
            }
            
            const userPreparationNames = new Set(userPreparations.map(p => p.name.toLowerCase()));
            let copiedCount = 0;

            for (const prep of basePreparations) {
                // Check if user already has a preparation with the same name (case-insensitive)
                if (!userPreparationNames.has(prep.name.toLowerCase())) {
                    // Create a copy for the user with a new ID
                    const newPrep = {
                        ...prep,
                        id: 'prep-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                        userId: userId,
                        isCustom: 0  // Mark as base preparation (not custom)
                    };

                    // Ensure ingredients is a string (JSON)
                    const ingredientsJson = typeof newPrep.ingredients === 'string' 
                        ? newPrep.ingredients 
                        : JSON.stringify(newPrep.ingredients || []);
                    
                    const instructionsJson = typeof newPrep.instructions === 'string'
                        ? newPrep.instructions
                        : JSON.stringify(newPrep.instructions || []);
                    
                    const tipsJson = typeof newPrep.tips === 'string'
                        ? newPrep.tips
                        : JSON.stringify(newPrep.tips || []);

                    if (this.isSQLite) {
                        const stmt = this.db.prepare(`
                            INSERT INTO Preparations (id, name, category, description, yield, prepTime, difficulty, ingredients, instructions, tips, dateAdded, isCustom, userId)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `);
                        stmt.run(
                            newPrep.id,
                            newPrep.name,
                            newPrep.category,
                            newPrep.description || '',
                            newPrep.yield || 4,
                            newPrep.prepTime || '',
                            newPrep.difficulty || 'Media',
                            ingredientsJson,
                            instructionsJson,
                            tipsJson,
                            newPrep.dateAdded || Date.now(),
                            newPrep.isCustom ? 1 : 0,
                            userId
                        );
                    } else {
                        // Turso (libSQL) - use [yield] to avoid reserved word issues
                        await this.db.execute({
                            sql: 'INSERT INTO Preparations (id, name, category, description, [yield], prepTime, difficulty, ingredients, instructions, tips, dateAdded, isCustom, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            args: [
                                newPrep.id,
                                newPrep.name,
                                newPrep.category,
                                newPrep.description || '',
                                newPrep.yield || 4,
                                newPrep.prepTime || '',
                                newPrep.difficulty || 'Media',
                                ingredientsJson,
                                instructionsJson,
                                tipsJson,
                                newPrep.dateAdded || Date.now(),
                                newPrep.isCustom ? 1 : 0,
                                userId
                            ]
                        });
                    }
                    copiedCount++;
                }
            }

            console.log(`✅ Copied ${copiedCount} base preparations for user ${userId}`);
            return { success: true, copied: copiedCount };
        } catch (error) {
            console.error(`❌ Failed to copy base preparations for user ${userId}:`, error);
            return { success: false, error: error.message };
        }
    }
}


export default DatabaseAdapter;




