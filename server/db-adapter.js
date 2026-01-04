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
            availableIngredients: typeof record.availableIngredients === 'string' ? JSON.parse(record.availableIngredients || '[]') : (record.availableIngredients || [])
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
    // RECIPES
    // ==========================================

    async getAllRecipes() {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Recipes ORDER BY createdAt DESC');
            return stmt.all().map(r => this.parseRecipe(r));
        } else {
            // Turso
            const result = await this.db.execute('SELECT * FROM Recipes ORDER BY createdAt DESC');
            return result.rows.map(r => this.parseRecipe(r));
        }
    }

    async getRecipeById(id) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Recipes WHERE id = ?');
            return this.parseRecipe(stmt.get(id));
        } else {
            // Turso
            const result = await this.db.execute({
                sql: 'SELECT * FROM Recipes WHERE id = ?',
                args: [id]
            });
            return this.parseRecipe(result.rows[0]);
        }
    }

    async createRecipe(recipe) {
        const baseIngredientsJson = JSON.stringify(recipe.baseIngredients || []);
        const preparationsJson = JSON.stringify(recipe.preparations || []);
        const instructionsJson = JSON.stringify(recipe.instructions || []);
        const tagsJson = JSON.stringify(recipe.tags || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                INSERT INTO Recipes (id, name, pizzaiolo, source, description, baseIngredients, preparations, instructions, imageUrl, dough, suggestedDough, archetype, recipeSource, archetypeUsed, createdAt, dateAdded, isFavorite, rating, tags)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                recipe.id,
                recipe.name,
                recipe.pizzaiolo || 'Sconosciuto',
                recipe.source || '',
                recipe.description || '',
                baseIngredientsJson,
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
                tagsJson
            );
        } else {
            // Turso
            await this.db.execute({
                sql: `INSERT INTO Recipes (id, name, pizzaiolo, source, description, baseIngredients, preparations, instructions, imageUrl, dough, suggestedDough, archetype, recipeSource, archetypeUsed, createdAt, dateAdded, isFavorite, rating, tags)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    recipe.id,
                    recipe.name,
                    recipe.pizzaiolo || 'Sconosciuto',
                    recipe.source || '',
                    recipe.description || '',
                    baseIngredientsJson,
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
                    tagsJson
                ]
            });
        }
        return recipe;
    }

    async updateRecipe(id, updates) {
        // First, fetch the current recipe to merge with updates
        const currentRecipe = await this.getRecipeById(id);
        if (!currentRecipe) {
            throw new Error(`Recipe with id ${id} not found`);
        }

        // Merge updates with current recipe
        const recipe = { ...currentRecipe, ...updates };

        const baseIngredientsJson = JSON.stringify(recipe.baseIngredients || []);
        const preparationsJson = JSON.stringify(recipe.preparations || []);
        const instructionsJson = JSON.stringify(recipe.instructions || []);
        const tagsJson = JSON.stringify(recipe.tags || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                UPDATE Recipes 
                SET name=?, pizzaiolo=?, source=?, description=?, baseIngredients=?, preparations=?, instructions=?, 
                    imageUrl=?, dough=?, suggestedDough=?, archetype=?, recipeSource=?, archetypeUsed=?, isFavorite=?, rating=?, tags=?
                WHERE id = ?
            `);
            stmt.run(
                recipe.name,
                recipe.pizzaiolo || 'Sconosciuto',
                recipe.source || '',
                recipe.description || '',
                baseIngredientsJson,
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
                id
            );
        } else {
            await this.db.execute({
                sql: `UPDATE Recipes SET name=?, pizzaiolo=?, source=?, description=?, baseIngredients=?, preparations=?, instructions=?, imageUrl=?, dough=?, suggestedDough=?, archetype=?, recipeSource=?, archetypeUsed=?, isFavorite=?, rating=?, tags=? WHERE id = ?`,
                args: [recipe.name, recipe.pizzaiolo || 'Sconosciuto', recipe.source || '', recipe.description || '', baseIngredientsJson, preparationsJson, instructionsJson, recipe.imageUrl || '', recipe.dough || '', recipe.suggestedDough || '', recipe.archetype || '', recipe.recipeSource || null, recipe.archetypeUsed || null, recipe.isFavorite ? 1 : 0, recipe.rating || 0, tagsJson, id]
            });
        }
        return recipe;
    }

    async deleteRecipe(id) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('DELETE FROM Recipes WHERE id = ?');
            stmt.run(id);
        } else {
            await this.db.execute({ sql: 'DELETE FROM Recipes WHERE id = ?', args: [id] });
        }
    }

    // ==========================================
    // PIZZA NIGHTS
    // ==========================================

    async getAllPizzaNights() {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM PizzaNights ORDER BY date DESC');
            return stmt.all().map(r => this.parsePizzaNight(r));
        } else {
            const result = await this.db.execute('SELECT * FROM PizzaNights ORDER BY date DESC');
            return result.rows.map(r => this.parsePizzaNight(r));
        }
    }

    async getPizzaNightById(id) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM PizzaNights WHERE id = ?');
            const row = stmt.get(id);
            if (!row) return null;

            // Parse JSON fields
            const pizzaNight = {
                ...row,
                selectedPizzas: JSON.parse(row.selectedPizzas || '[]'),
                selectedGuests: JSON.parse(row.selectedGuests || '[]'),
                availableIngredients: JSON.parse(row.availableIngredients || '[]')
            };

            // Resolve selectedGuests IDs to full guest objects
            console.log('[DEBUG] selectedGuests IDs:', pizzaNight.selectedGuests);
            const guestStmt = this.db.prepare('SELECT * FROM Guests WHERE id = ?');
            pizzaNight.guests = pizzaNight.selectedGuests.map(guestId => {
                const guest = guestStmt.get(guestId);
                console.log(`[DEBUG] Guest ID ${guestId} resolved to:`, guest);
                return guest || { id: guestId, name: 'Unknown' };
            });
            console.log('[DEBUG] Final guests array:', pizzaNight.guests);

            return pizzaNight;
        } else {
            // Turso
            const result = await this.db.execute({
                sql: 'SELECT * FROM PizzaNights WHERE id = ?',
                args: [id]
            });
            if (!result.rows || result.rows.length === 0) return null;

            const row = result.rows[0];
            const pizzaNight = {
                ...row,
                selectedPizzas: JSON.parse(row.selectedPizzas || '[]'),
                selectedGuests: JSON.parse(row.selectedGuests || '[]'),
                availableIngredients: JSON.parse(row.availableIngredients || '[]')
            };

            // Resolve selectedGuests IDs to full guest objects (Turso)
            pizzaNight.guests = [];
            for (const guestId of pizzaNight.selectedGuests) {
                const guestResult = await this.db.execute({
                    sql: 'SELECT * FROM Guests WHERE id = ?',
                    args: [guestId]
                });
                const guest = guestResult.rows[0];
                pizzaNight.guests.push(guest || { id: guestId, name: 'Unknown' });
            }

            return pizzaNight;
        }
    }

    async createPizzaNight(night) {
        const selectedPizzasJson = JSON.stringify(night.selectedPizzas || []);
        const selectedGuestsJson = JSON.stringify(night.selectedGuests || []);
        const availableIngredientsJson = JSON.stringify(night.availableIngredients || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                INSERT INTO PizzaNights (id, name, date, guestCount, selectedDough, availableIngredients, selectedPizzas, selectedGuests, notes, status, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                night.status,
                night.createdAt
            );
        } else {
            await this.db.execute({
                sql: `INSERT INTO PizzaNights (id, name, date, guestCount, selectedDough, availableIngredients, selectedPizzas, selectedGuests, notes, status, createdAt)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                    night.status,
                    night.createdAt
                ]
            });
        }
        return night;
    }

    async updatePizzaNight(id, updates) {
        // Fetch current night to merge with updates
        const currentNight = await this.getPizzaNightById(id);
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
                SET name=?, date=?, guestCount=?, selectedDough=?, availableIngredients=?, selectedPizzas=?, selectedGuests=?, notes=?, status=?
                WHERE id=?
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
                night.status,
                id
            );
        } else {
            await this.db.execute({
                sql: `UPDATE PizzaNights 
                      SET name=?, date=?, guestCount=?, selectedDough=?, availableIngredients=?, 
                          selectedPizzas=?, selectedGuests=?, notes=?, status=?
                      WHERE id=?`,
                args: [
                    night.name,
                    night.date,
                    night.guestCount,
                    night.selectedDough || null,
                    availableIngredientsJson,
                    selectedPizzasJson,
                    selectedGuestsJson,
                    night.notes || '',
                    night.status,
                    id
                ]
            });
        }
        return night;
    }

    async deletePizzaNight(id) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('DELETE FROM PizzaNights WHERE id=?');
            stmt.run(id);
        } else {
            await this.db.execute({ sql: 'DELETE FROM PizzaNights WHERE id=?', args: [id] });
        }
    }

    // ==========================================
    // GUESTS
    // ==========================================

    async getAllGuests() {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Guests');
            return stmt.all();
        } else {
            const result = await this.db.execute('SELECT * FROM Guests');
            return result.rows;
        }
    }

    async createGuest(guest) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('INSERT INTO Guests (id, name, email, phone, createdAt) VALUES (?, ?, ?, ?, ?)');
            stmt.run(guest.id, guest.name, guest.email || null, guest.phone || null, guest.createdAt);
        } else {
            await this.db.execute({
                sql: 'INSERT INTO Guests (id, name, email, phone, createdAt) VALUES (?, ?, ?, ?, ?)',
                args: [guest.id, guest.name, guest.email || null, guest.phone || null, guest.createdAt]
            });
        }
        return guest;
    }

    async updateGuest(id, updates) {
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
        const sql = `UPDATE Guests SET ${fields.join(', ')} WHERE id = ?`;

        if (this.isSQLite) {
            const stmt = this.db.prepare(sql);
            stmt.run(...values);
        } else {
            await this.db.execute({ sql, args: values });
        }

        return this.getGuestById(id);
    }

    async getGuestById(id) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Guests WHERE id = ?');
            return stmt.get(id);
        } else {
            const result = await this.db.execute({
                sql: 'SELECT * FROM Guests WHERE id = ?',
                args: [id]
            });
            return result.rows[0] || null;
        }
    }

    async deleteGuest(id) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('DELETE FROM Guests WHERE id=?');
            stmt.run(id);
        } else {
            await this.db.execute({ sql: 'DELETE FROM Guests WHERE id=?', args: [id] });
        }
    }

    // ==========================================
    // COMBINATIONS
    // ==========================================

    async getAllCombinations() {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Combinations');
            return stmt.all().map(r => this.parseCombination(r));
        } else {
            const result = await this.db.execute('SELECT * FROM Combinations');
            return result.rows.map(r => this.parseCombination(r));
        }
    }

    async createCombination(combo) {
        const ingredientsJson = JSON.stringify(combo.ingredients || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare('INSERT INTO Combinations (id, ingredients, createdAt) VALUES (?, ?, ?)');
            stmt.run(combo.id, ingredientsJson, combo.createdAt);
        } else {
            await this.db.execute({
                sql: 'INSERT INTO Combinations (id, ingredients, createdAt) VALUES (?, ?, ?)',
                args: [combo.id, ingredientsJson, combo.createdAt]
            });
        }
        return combo;
    }

    async deleteCombination(id) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('DELETE FROM Combinations WHERE id=?');
            stmt.run(id);
        } else {
            await this.db.execute({ sql: 'DELETE FROM Combinations WHERE id=?', args: [id] });
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

    async getAllPreparations() {
        let preps;
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Preparations ORDER BY name');
            preps = stmt.all().map(r => this.parsePreparation(r));
        } else {
            const result = await this.db.execute('SELECT * FROM Preparations ORDER BY name');
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
            const fetchedIngredients = await this.batchFetchIngredients(idsArray);

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
    async expandIngredients(ingredients) {
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
                        WHERE i.id IN (${placeholders})
                    `);
                    fetchedIngredients = stmt.all(...idsToFetch);
                } else {
                    // Turso - build IN clause with placeholders
                    const placeholders = idsToFetch.map(() => '?').join(',');
                    const result = await this.db.execute({
                        sql: `
                            SELECT i.*, c.name as categoryName, c.icon as categoryIcon
                            FROM Ingredients i
                            LEFT JOIN Categories c ON i.categoryId = c.id
                            WHERE i.id IN (${placeholders})
                        `,
                        args: idsToFetch
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
    async batchFetchIngredients(ids) {
        if (ids.length === 0) return [];

        if (this.isSQLite) {
            const placeholders = ids.map(() => '?').join(',');
            const stmt = this.db.prepare(`
                SELECT i.*, c.name as categoryName, c.icon as categoryIcon
                FROM Ingredients i
                LEFT JOIN Categories c ON i.categoryId = c.id
                WHERE i.id IN (${placeholders})
            `);
            return stmt.all(...ids);
        } else {
            const placeholders = ids.map(() => '?').join(',');
            const result = await this.db.execute({
                sql: `
                    SELECT i.*, c.name as categoryName, c.icon as categoryIcon
                    FROM Ingredients i
                    LEFT JOIN Categories c ON i.categoryId = c.id
                    WHERE i.id IN (${placeholders})
                `,
                args: ids
            });
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

    async getPreparationById(id) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Preparations WHERE id = ?');
            const prep = this.parsePreparation(stmt.get(id));
            if (prep) {
                prep.ingredients = await this.expandIngredients(prep.ingredients);
            }
            return prep;
        } else {
            // Turso
            const result = await this.db.execute({ sql: 'SELECT * FROM Preparations WHERE id = ?', args: [id] });
            const prep = this.parsePreparation(result.rows[0]);
            if (prep) {
                prep.ingredients = await this.expandIngredients(prep.ingredients);
            }
            return prep;
        }
    }

    async createPreparation(prep) {
        const ingredientsJson = JSON.stringify(prep.ingredients || []);
        const instructionsJson = JSON.stringify(prep.instructions || []);
        const tipsJson = JSON.stringify(prep.tips || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                INSERT INTO Preparations (id, name, category, description, yield, prepTime, difficulty, ingredients, instructions, tips, dateAdded, isCustom)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                prep.isCustom !== undefined ? (prep.isCustom ? 1 : 0) : 1
            );
        } else {
            await this.db.execute(`
                INSERT INTO Preparations (id, name, category, description, [yield], prepTime, difficulty, ingredients, instructions, tips, dateAdded, isCustom)
                VALUES (@id, @name, @category, @description, @yield, @prepTime, @difficulty, @ingredients, @instructions, @tips, @dateAdded, @isCustom)
            `, {
                id: prep.id,
                name: prep.name,
                category: prep.category,
                description: prep.description || '',
                yield: prep.yield || 4,
                prepTime: prep.prepTime || '',
                difficulty: prep.difficulty || 'Media',
                ingredients: ingredientsJson,
                instructions: instructionsJson,
                tips: tipsJson,
                dateAdded: prep.dateAdded || Date.now(),
                isCustom: prep.isCustom !== undefined ? (prep.isCustom ? 1 : 0) : 1
            });
        }
        return prep;
    }

    async updatePreparation(id, prep) {
        const ingredientsJson = JSON.stringify(prep.ingredients || []);
        const instructionsJson = JSON.stringify(prep.instructions || []);
        const tipsJson = JSON.stringify(prep.tips || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                UPDATE Preparations 
                SET name=?, category=?, description=?, yield=?, prepTime=?, difficulty=?, 
                    ingredients=?, instructions=?, tips=?
                WHERE id=?
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
                id
            );
        } else {
            await this.db.execute(`
                UPDATE Preparations 
                SET name=@name, category=@category, description=@description, [yield]=@yield, 
                    prepTime=@prepTime, difficulty=@difficulty, ingredients=@ingredients, 
                    instructions=@instructions, tips=@tips
                WHERE id=@id
            `, {
                id,
                name: prep.name,
                category: prep.category,
                description: prep.description || '',
                yield: prep.yield || 4,
                prepTime: prep.prepTime || '',
                difficulty: prep.difficulty || 'Media',
                ingredients: ingredientsJson,
                instructions: instructionsJson,
                tips: tipsJson
            });
        }
        return prep;
    }

    async deletePreparation(id) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('DELETE FROM Preparations WHERE id=?');
            stmt.run(id);
        } else {
            await this.db.execute({ sql: 'DELETE FROM Preparations WHERE id=?', args: [id] });
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

    async getAllIngredients() {
        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                SELECT i.*, c.name as categoryName, c.icon as categoryIcon
                FROM Ingredients i
                LEFT JOIN Categories c ON i.categoryId = c.id
                ORDER BY c.displayOrder, i.name
            `);
            return stmt.all().map(r => {
                const parsed = this.parseIngredient(r);
                parsed.category = r.categoryName;
                parsed.categoryIcon = r.categoryIcon;
                return parsed;
            });
        } else {
            const result = await this.db.execute(`
                SELECT i.*, c.name as categoryName, c.icon as categoryIcon
                FROM Ingredients i
                LEFT JOIN Categories c ON i.categoryId = c.id
                ORDER BY c.displayOrder, i.name
            `);
            return result.rows.map(r => {
                const parsed = this.parseIngredient(r);
                parsed.category = r.categoryName;
                parsed.categoryIcon = r.categoryIcon;
                return parsed;
            });
        }
    }

    async getIngredientById(id) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Ingredients WHERE id = ?');
            return this.parseIngredient(stmt.get(id));
        } else {
            // Turso
            const result = await this.db.execute({ sql: 'SELECT * FROM Ingredients WHERE id = ?', args: [id] });
            return this.parseIngredient(result.rows[0]);
        }
    }

    async getIngredientsByCategory(category) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Ingredients WHERE category = ? ORDER BY name');
            return stmt.all(category).map(r => this.parseIngredient(r));
        } else {
            // Turso
            const result = await this.db.execute({ sql: 'SELECT * FROM Ingredients WHERE category = ? ORDER BY name', args: [category] });
            return result.rows.map(r => this.parseIngredient(r));
        }
    }

    async searchIngredients(searchQuery) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Ingredients WHERE name LIKE ? ORDER BY name');
            return stmt.all(`%${searchQuery}%`).map(r => this.parseIngredient(r));
        } else {
            // Turso
            const result = await this.db.execute({ sql: 'SELECT * FROM Ingredients WHERE name LIKE ? ORDER BY name', args: [`%${searchQuery}%`] });
            return result.rows.map(r => this.parseIngredient(r));
        }
    }

    async createIngredient(ingredient) {
        const seasonJson = ingredient.season ? JSON.stringify(ingredient.season) : null;
        const allergensJson = JSON.stringify(ingredient.allergens || []);
        const tagsJson = JSON.stringify(ingredient.tags || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                INSERT INTO Ingredients (id, name, category, subcategory, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                ingredient.id,
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
                ingredient.isCustom ? 1 : 0,
                ingredient.dateAdded || Date.now()
            );
        } else {
            await this.db.execute(`
                INSERT INTO Ingredients (id, name, category, subcategory, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded)
                VALUES (@id, @name, @category, @subcategory, @minWeight, @maxWeight, @defaultUnit, @postBake, @phase, @season, @allergens, @tags, @isCustom, @dateAdded)
            `, {
                id: ingredient.id,
                name: ingredient.name,
                category: ingredient.category,
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
                dateAdded: ingredient.dateAdded || Date.now()
            });
        }
        return ingredient;
    }

    async updateIngredient(id, ingredient) {
        const seasonJson = ingredient.season ? JSON.stringify(ingredient.season) : null;
        const allergensJson = JSON.stringify(ingredient.allergens || []);
        const tagsJson = JSON.stringify(ingredient.tags || []);

        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                UPDATE Ingredients 
                SET name=?, category=?, subcategory=?, minWeight=?, maxWeight=?, defaultUnit=?, postBake=?, phase=?, season=?, allergens=?, tags=?
                WHERE id = ?
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
                id
            );
        } else {
            await this.db.execute(`
                UPDATE Ingredients 
                SET name=@name, category=@category, subcategory=@subcategory, minWeight=@minWeight, maxWeight=@maxWeight, 
                    defaultUnit=@defaultUnit, postBake=@postBake, phase=@phase, season=@season, allergens=@allergens, tags=@tags
                WHERE id = @id
            `, {
                id,
                name: ingredient.name,
                category: ingredient.category,
                subcategory: ingredient.subcategory || null,
                minWeight: ingredient.minWeight || null,
                maxWeight: ingredient.maxWeight || null,
                defaultUnit: ingredient.defaultUnit || 'g',
                postBake: ingredient.postBake ? 1 : 0,
                phase: ingredient.phase || 'topping',
                season: seasonJson,
                allergens: allergensJson,
                tags: tagsJson
            });
        }
        return ingredient;
    }

    async deleteIngredient(id) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('DELETE FROM Ingredients WHERE id=?');
            stmt.run(id);
        } else {
            await this.db.execute({ sql: 'DELETE FROM Ingredients WHERE id=?', args: [id] });
        }
    }

    // ============================================
    // CATEGORIES
    // ============================================

    async getAllCategories() {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Categories ORDER BY displayOrder');
            return stmt.all();
        } else {
            const result = await this.db.execute('SELECT * FROM Categories ORDER BY displayOrder');
            return result.rows;
        }
    }

    async getCategoryById(id) {
        if (this.isSQLite) {
            const stmt = this.db.prepare('SELECT * FROM Categories WHERE id = ?');
            return stmt.get(id);
        } else {
            const result = await this.db.execute({ sql: 'SELECT * FROM Categories WHERE id = ?', args: [id] });
            return result.rows[0];
        }
    }

    // ============================================
    // ARCHETYPE WEIGHTS
    // ============================================

    async getArchetypeWeights(userId = 'default') {
        console.log('🔍 Backend getArchetypeWeights called with userId:', userId);
        // console.log('🔍 Database type:', this.type); // this.type doesn't exist, use this.isSQLite/this.isTurso
        console.log('🔍 Database instance:', this.db ? 'exists' : 'null');

        if (this.isSQLite) {
            const rows = this.db.prepare(`
                SELECT archetype, weight, description
                FROM ArchetypeWeights
                WHERE userId = ?
                ORDER BY weight DESC
            `).all(userId);

            console.log('🔍 Query returned', rows.length, 'rows');
            console.log('🔍 Rows:', JSON.stringify(rows, null, 2));

            return rows;
        } else {
            console.log('⚠️ SQL Server mode - not implemented');
            // SQL Server not yet implemented
            return [];
        }
    }

    async updateArchetypeWeight(userId, archetype, weight) {
        if (this.isSQLite) {
            const stmt = this.db.prepare(`
                UPDATE ArchetypeWeights
                SET weight = ?, dateModified = ?
                WHERE userId = ? AND archetype = ?
            `);
            stmt.run(weight, Date.now(), userId, archetype);
            return { userId, archetype, weight };
        } else {
            // SQL Server not yet implemented
            return { userId, archetype, weight };
        }
    }

    async resetArchetypeWeights(userId = 'default') {
        console.log('🔄 resetArchetypeWeights called with userId:', userId);
        if (this.isSQLite) {
            const defaults = [
                { archetype: 'combinazioni_db', weight: 30, description: 'Combinazioni salvate nel database' },
                { archetype: 'classica', weight: 28, description: 'Margherita, Marinara style' },
                { archetype: 'tradizionale', weight: 21, description: 'Prosciutto, Funghi, Capricciosa' },
                { archetype: 'terra_bosco', weight: 7, description: 'Funghi porcini, tartufo' },
                { archetype: 'fresca_estiva', weight: 7, description: 'Verdure, pomodorini' },
                { archetype: 'piccante_decisa', weight: 4, description: 'Nduja, peperoncino' },
                { archetype: 'mare', weight: 2, description: 'Pesce, frutti di mare' },
                { archetype: 'vegana', weight: 1, description: 'Solo vegetali' }
            ];

            // Use INSERT OR REPLACE to handle both initialization and reset
            const stmt = this.db.prepare(`
                INSERT OR REPLACE INTO ArchetypeWeights (id, userId, archetype, weight, description, dateModified)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            const now = Date.now();
            let updated = 0;
            defaults.forEach(d => {
                const id = `aw-${userId}-${d.archetype}`;
                const result = stmt.run(id, userId, d.archetype, d.weight, d.description, now);
                console.log(`  Updated ${d.archetype}: ${result.changes} rows`);
                updated += result.changes;
            });

            console.log(`✅ Reset complete: ${updated} weights updated`);
            return { success: true, userId, updated };
        } else {
            // SQL Server not yet implemented
            console.log('⚠️ SQL Server mode - reset not implemented');
            return { success: true, userId };
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
}

// ============================================
// ARCHETYPE WEIGHTS
// ============================================

/**
 * Get archetype weights for user
 */
export function getArchetypeWeights(userId = 'default') {
    if (useSql) {
        // SQL Server not yet implemented for archetype weights
        return [];
    } else {
        const rows = db.prepare(`
            SELECT archetype, weight, description
            FROM ArchetypeWeights
            WHERE userId = ?
            ORDER BY weight DESC
        `).all(userId);

        return rows;
    }
}

/**
 * Update archetype weight
 */
export function updateArchetypeWeight(userId = 'default', archetype, weight) {
    if (useSql) {
        // SQL Server not yet implemented
        return { success: false, error: 'Not implemented for SQL Server' };
    } else {
        const id = `aw-${userId}-${archetype}`;
        const now = Date.now();

        db.prepare(`
            INSERT INTO ArchetypeWeights (id, userId, archetype, weight, dateModified)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(userId, archetype) DO UPDATE SET
                weight = excluded.weight,
                dateModified = excluded.dateModified
        `).run(id, userId, archetype, weight, now);

        return { success: true };
    }
}

/**
 * Reset archetype weights to default
 */
export function resetArchetypeWeights(userId = 'default') {
    if (useSql) {
        // SQL Server not yet implemented
        return { success: false, error: 'Not implemented for SQL Server' };
    } else {
        db.prepare(`DELETE FROM ArchetypeWeights WHERE userId = ?`).run(userId);

        // Copy from default
        db.prepare(`
            INSERT INTO ArchetypeWeights (id, userId, archetype, weight, description, dateModified)
            SELECT 
                'aw-' || ? || '-' || archetype,
                ?,
                archetype,
                weight,
                description,
                ?
            FROM ArchetypeWeights
            WHERE userId = 'default'
        `).run(userId, userId, Date.now());

        return { success: true };
    }
}

export default DatabaseAdapter;




