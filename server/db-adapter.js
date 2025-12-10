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
                INSERT INTO PizzaNights (id, name, date, guestCount, selectedPizzas, selectedGuests, notes, status, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                night.id,
                night.name,
                night.date,
                night.guestCount,
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
}

export default DatabaseAdapter;

