import { getDb, getDbType } from './db.js';
import { query } from './db-mssql.js';

const dbType = getDbType();

// ==========================================
// DATABASE ADAPTER
// ==========================================

/**
 * Adapter pattern to abstract database operations
 */
class DatabaseAdapter {
    constructor() {
        this.type = dbType;
        this.db = getDb();
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
            selectedGuests: typeof record.selectedGuests === 'string' ? JSON.parse(record.selectedGuests || '[]') : record.selectedGuests
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
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('SELECT * FROM Recipes ORDER BY createdAt DESC');
            return stmt.all().map(r => this.parseRecipe(r));
        } else {
            const result = await query('SELECT * FROM Recipes ORDER BY createdAt DESC');
            return result.recordset.map(r => this.parseRecipe(r));
        }
    }

    async getRecipeById(id) {
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('SELECT * FROM Recipes WHERE id = ?');
            return this.parseRecipe(stmt.get(id));
        } else {
            const result = await query('SELECT * FROM Recipes WHERE id = @id', { id });
            return this.parseRecipe(result.recordset[0]);
        }
    }

    async createRecipe(recipe) {
        const baseIngredientsJson = JSON.stringify(recipe.baseIngredients || []);
        const preparationsJson = JSON.stringify(recipe.preparations || []);
        const instructionsJson = JSON.stringify(recipe.instructions || []);
        const tagsJson = JSON.stringify(recipe.tags || []);

        if (this.type === 'sqlite') {
            const stmt = this.db.prepare(`
                INSERT INTO Recipes (id, name, pizzaiolo, source, description, baseIngredients, preparations, instructions, imageUrl, dough, suggestedDough, archetype, createdAt, dateAdded, isFavorite, rating, tags)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                recipe.createdAt || Date.now(),
                recipe.dateAdded || Date.now(),
                recipe.isFavorite ? 1 : 0,
                recipe.rating || 0,
                tagsJson
            );
        } else {
            await query(`
                INSERT INTO Recipes (id, name, pizzaiolo, source, description, baseIngredients, preparations, instructions, imageUrl, dough, suggestedDough, archetype, createdAt, dateAdded, isFavorite, rating, tags)
                VALUES (@id, @name, @pizzaiolo, @source, @description, @baseIngredients, @preparations, @instructions, @imageUrl, @dough, @suggestedDough, @archetype, @createdAt, @dateAdded, @isFavorite, @rating, @tags)
            `, {
                id: recipe.id,
                name: recipe.name,
                pizzaiolo: recipe.pizzaiolo || 'Sconosciuto',
                source: recipe.source || '',
                description: recipe.description || '',
                baseIngredients: baseIngredientsJson,
                preparations: preparationsJson,
                instructions: instructionsJson,
                imageUrl: recipe.imageUrl || '',
                dough: recipe.dough || '',
                suggestedDough: recipe.suggestedDough || '',
                archetype: recipe.archetype || '',
                createdAt: recipe.createdAt || Date.now(),
                dateAdded: recipe.dateAdded || Date.now(),
                isFavorite: recipe.isFavorite ? 1 : 0,
                rating: recipe.rating || 0,
                tags: tagsJson
            });
        }
        return recipe;
    }

    async updateRecipe(id, recipe) {
        const baseIngredientsJson = JSON.stringify(recipe.baseIngredients || []);
        const preparationsJson = JSON.stringify(recipe.preparations || []);
        const instructionsJson = JSON.stringify(recipe.instructions || []);
        const tagsJson = JSON.stringify(recipe.tags || []);

        if (this.type === 'sqlite') {
            const stmt = this.db.prepare(`
                UPDATE Recipes 
                SET name=?, pizzaiolo=?, source=?, description=?, baseIngredients=?, preparations=?, instructions=?, 
                    imageUrl=?, dough=?, suggestedDough=?, archetype=?, isFavorite=?, rating=?, tags=?
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
                recipe.isFavorite ? 1 : 0,
                recipe.rating || 0,
                tagsJson,
                id
            );
        } else {
            await query(`
                UPDATE Recipes 
                SET name=@name, pizzaiolo=@pizzaiolo, source=@source, description=@description, 
                    baseIngredients=@baseIngredients, preparations=@preparations, instructions=@instructions, imageUrl=@imageUrl, 
                    dough=@dough, suggestedDough=@suggestedDough, archetype=@archetype, isFavorite=@isFavorite, rating=@rating, tags=@tags
                WHERE id = @id
            `, {
                id,
                name: recipe.name,
                pizzaiolo: recipe.pizzaiolo || 'Sconosciuto',
                source: recipe.source || '',
                description: recipe.description || '',
                baseIngredients: baseIngredientsJson,
                preparations: preparationsJson,
                instructions: instructionsJson,
                imageUrl: recipe.imageUrl || '',
                dough: recipe.dough || '',
                suggestedDough: recipe.suggestedDough || '',
                archetype: recipe.archetype || '',
                isFavorite: recipe.isFavorite ? 1 : 0,
                rating: recipe.rating || 0,
                tags: tagsJson
            });
        }
        return recipe;
    }

    async deleteRecipe(id) {
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('DELETE FROM Recipes WHERE id = ?');
            stmt.run(id);
        } else {
            await query('DELETE FROM Recipes WHERE id = @id', { id });
        }
    }

    // ==========================================
    // PIZZA NIGHTS
    // ==========================================

    async getAllPizzaNights() {
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('SELECT * FROM PizzaNights ORDER BY date DESC');
            return stmt.all().map(r => this.parsePizzaNight(r));
        } else {
            const result = await query('SELECT * FROM PizzaNights ORDER BY date DESC');
            return result.recordset.map(r => this.parsePizzaNight(r));
        }
    }

    async createPizzaNight(night) {
        const selectedPizzasJson = JSON.stringify(night.selectedPizzas || []);
        const selectedGuestsJson = JSON.stringify(night.selectedGuests || []);

        if (this.type === 'sqlite') {
            const stmt = this.db.prepare(`
                INSERT INTO PizzaNights (id, name, date, guestCount, selectedDough, selectedPizzas, selectedGuests, notes, status, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                night.id,
                night.name,
                night.date,
                night.guestCount,
                night.selectedDough || null,
                selectedPizzasJson,
                selectedGuestsJson,
                night.notes || '',
                night.status,
                night.createdAt
            );
        } else {
            await query(`
                INSERT INTO PizzaNights (id, name, date, guestCount, selectedPizzas, selectedGuests, notes, status, createdAt)
                VALUES (@id, @name, @date, @guestCount, @selectedPizzas, @selectedGuests, @notes, @status, @createdAt)
            `, {
                id: night.id,
                name: night.name,
                date: night.date,
                guestCount: night.guestCount,
                selectedPizzas: selectedPizzasJson,
                selectedGuests: selectedGuestsJson,
                notes: night.notes || '',
                status: night.status,
                createdAt: night.createdAt
            });
        }
        return night;
    }

    async updatePizzaNight(id, night) {
        const selectedPizzasJson = JSON.stringify(night.selectedPizzas || []);
        const selectedGuestsJson = JSON.stringify(night.selectedGuests || []);

        if (this.type === 'sqlite') {
            const stmt = this.db.prepare(`
                UPDATE PizzaNights 
                SET name=?, date=?, guestCount=?, selectedPizzas=?, selectedGuests=?, notes=?, status=?
                WHERE id=?
            `);
            stmt.run(
                night.name,
                night.date,
                night.guestCount,
                selectedPizzasJson,
                selectedGuestsJson,
                night.notes || '',
                night.status,
                id
            );
        } else {
            await query(`
                UPDATE PizzaNights 
                SET name=@name, date=@date, guestCount=@guestCount, selectedPizzas=@selectedPizzas, 
                    selectedGuests=@selectedGuests, notes=@notes, status=@status
                WHERE id=@id
            `, {
                id,
                name: night.name,
                date: night.date,
                guestCount: night.guestCount,
                selectedPizzas: selectedPizzasJson,
                selectedGuests: selectedGuestsJson,
                notes: night.notes || '',
                status: night.status
            });
        }
        return night;
    }

    async deletePizzaNight(id) {
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('DELETE FROM PizzaNights WHERE id=?');
            stmt.run(id);
        } else {
            await query('DELETE FROM PizzaNights WHERE id=@id', { id });
        }
    }

    // ==========================================
    // GUESTS
    // ==========================================

    async getAllGuests() {
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('SELECT * FROM Guests');
            return stmt.all();
        } else {
            const result = await query('SELECT * FROM Guests');
            return result.recordset;
        }
    }

    async createGuest(guest) {
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('INSERT INTO Guests (id, name, createdAt) VALUES (?, ?, ?)');
            stmt.run(guest.id, guest.name, guest.createdAt);
        } else {
            await query('INSERT INTO Guests (id, name, createdAt) VALUES (@id, @name, @createdAt)', {
                id: guest.id,
                name: guest.name,
                createdAt: guest.createdAt
            });
        }
        return guest;
    }

    async deleteGuest(id) {
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('DELETE FROM Guests WHERE id=?');
            stmt.run(id);
        } else {
            await query('DELETE FROM Guests WHERE id=@id', { id });
        }
    }

    // ==========================================
    // COMBINATIONS
    // ==========================================

    async getAllCombinations() {
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('SELECT * FROM Combinations');
            return stmt.all().map(r => this.parseCombination(r));
        } else {
            const result = await query('SELECT * FROM Combinations');
            return result.recordset.map(r => this.parseCombination(r));
        }
    }

    async createCombination(combo) {
        const ingredientsJson = JSON.stringify(combo.ingredients || []);

        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('INSERT INTO Combinations (id, ingredients, createdAt) VALUES (?, ?, ?)');
            stmt.run(combo.id, ingredientsJson, combo.createdAt);
        } else {
            await query('INSERT INTO Combinations (id, ingredients, createdAt) VALUES (@id, @ingredients, @createdAt)', {
                id: combo.id,
                ingredients: ingredientsJson,
                createdAt: combo.createdAt
            });
        }
        return combo;
    }

    async deleteCombination(id) {
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('DELETE FROM Combinations WHERE id=?');
            stmt.run(id);
        } else {
            await query('DELETE FROM Combinations WHERE id=@id', { id });
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
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('SELECT * FROM Preparations ORDER BY name');
            return stmt.all().map(r => this.parsePreparation(r));
        } else {
            const result = await query('SELECT * FROM Preparations ORDER BY name');
            return result.recordset.map(r => this.parsePreparation(r));
        }
    }

    async getPreparationById(id) {
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('SELECT * FROM Preparations WHERE id = ?');
            return this.parsePreparation(stmt.get(id));
        } else {
            const result = await query('SELECT * FROM Preparations WHERE id = @id', { id });
            return this.parsePreparation(result.recordset[0]);
        }
    }

    async createPreparation(prep) {
        const ingredientsJson = JSON.stringify(prep.ingredients || []);
        const instructionsJson = JSON.stringify(prep.instructions || []);
        const tipsJson = JSON.stringify(prep.tips || []);

        if (this.type === 'sqlite') {
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
            await query(`
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

        if (this.type === 'sqlite') {
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
            await query(`
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
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('DELETE FROM Preparations WHERE id=?');
            stmt.run(id);
        } else {
            await query('DELETE FROM Preparations WHERE id=@id', { id });
        }
    }

    // ==========================================
    // INGREDIENTS
    // ==========================================

    parseIngredient(record) {
        if (!record) return null;
        return {
            ...record,
            season: record.season ? (typeof record.season === 'string' ? JSON.parse(record.season) : record.season) : null,
            allergens: record.allergens ? (typeof record.allergens === 'string' ? JSON.parse(record.allergens) : record.allergens) : [],
            tags: record.tags ? (typeof record.tags === 'string' ? JSON.parse(record.tags) : record.tags) : [],
            postBake: !!record.postBake,
            isCustom: !!record.isCustom
        };
    }

    async getAllIngredients() {
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('SELECT * FROM Ingredients ORDER BY category, name');
            return stmt.all().map(r => this.parseIngredient(r));
        } else {
            const result = await query('SELECT * FROM Ingredients ORDER BY category, name');
            return result.recordset.map(r => this.parseIngredient(r));
        }
    }

    async getIngredientById(id) {
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('SELECT * FROM Ingredients WHERE id = ?');
            return this.parseIngredient(stmt.get(id));
        } else {
            const result = await query('SELECT * FROM Ingredients WHERE id = @id', { id });
            return this.parseIngredient(result.recordset[0]);
        }
    }

    async getIngredientsByCategory(category) {
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('SELECT * FROM Ingredients WHERE category = ? ORDER BY name');
            return stmt.all(category).map(r => this.parseIngredient(r));
        } else {
            const result = await query('SELECT * FROM Ingredients WHERE category = @category ORDER BY name', { category });
            return result.recordset.map(r => this.parseIngredient(r));
        }
    }

    async searchIngredients(searchQuery) {
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('SELECT * FROM Ingredients WHERE name LIKE ? ORDER BY name');
            return stmt.all(`%${searchQuery}%`).map(r => this.parseIngredient(r));
        } else {
            const result = await query('SELECT * FROM Ingredients WHERE name LIKE @query ORDER BY name', { query: `%${searchQuery}%` });
            return result.recordset.map(r => this.parseIngredient(r));
        }
    }

    async createIngredient(ingredient) {
        const seasonJson = ingredient.season ? JSON.stringify(ingredient.season) : null;
        const allergensJson = JSON.stringify(ingredient.allergens || []);
        const tagsJson = JSON.stringify(ingredient.tags || []);

        if (this.type === 'sqlite') {
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
            await query(`
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

        if (this.type === 'sqlite') {
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
            await query(`
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
        if (this.type === 'sqlite') {
            const stmt = this.db.prepare('DELETE FROM Ingredients WHERE id=?');
            stmt.run(id);
        } else {
            await query('DELETE FROM Ingredients WHERE id=@id', { id });
        }
    }

    // ============================================
    // ARCHETYPE WEIGHTS
    // ============================================

    async getArchetypeWeights(userId = 'default') {
        console.log('🔍 Backend getArchetypeWeights called with userId:', userId);
        console.log('🔍 Database type:', this.type);
        console.log('🔍 Database instance:', this.db ? 'exists' : 'null');

        if (this.type === 'sqlite') {
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
        if (this.type === 'sqlite') {
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
        if (this.type === 'sqlite') {
            const defaults = [
                { archetype: 'combinazioni_db', weight: 30 },
                { archetype: 'classica', weight: 28 },
                { archetype: 'tradizionale', weight: 21 },
                { archetype: 'terra_bosco', weight: 7 },
                { archetype: 'fresca_estiva', weight: 7 },
                { archetype: 'piccante_decisa', weight: 4 },
                { archetype: 'mare', weight: 2 },
                { archetype: 'vegana', weight: 1 }
            ];

            const stmt = this.db.prepare(`
                UPDATE ArchetypeWeights
                SET weight = ?, dateModified = ?
                WHERE userId = ? AND archetype = ?
            `);

            const now = Date.now();
            defaults.forEach(d => {
                stmt.run(d.weight, now, userId, d.archetype);
            });

            return { success: true, userId };
        } else {
            // SQL Server not yet implemented
            return { success: true, userId };
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

