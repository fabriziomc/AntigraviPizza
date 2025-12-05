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
            ingredients: typeof record.ingredients === 'string' ? JSON.parse(record.ingredients || '[]') : record.ingredients,
            instructions: typeof record.instructions === 'string' ? JSON.parse(record.instructions || '[]') : record.instructions,
            tags: typeof record.tags === 'string' ? JSON.parse(record.tags || '[]') : record.tags,
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
        const ingredientsJson = JSON.stringify(recipe.ingredients || []);
        const instructionsJson = JSON.stringify(recipe.instructions || []);
        const tagsJson = JSON.stringify(recipe.tags || []);

        if (this.type === 'sqlite') {
            const stmt = this.db.prepare(`
                INSERT INTO Recipes (id, name, pizzaiolo, source, description, ingredients, instructions, imageUrl, archetype, createdAt, dateAdded, isFavorite, rating, tags)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                recipe.id,
                recipe.name,
                recipe.pizzaiolo || 'Sconosciuto',
                recipe.source || '',
                recipe.description || '',
                ingredientsJson,
                instructionsJson,
                recipe.imageUrl || '',
                recipe.archetype || '',
                recipe.createdAt || Date.now(),
                recipe.dateAdded || Date.now(),
                recipe.isFavorite ? 1 : 0,
                recipe.rating || 0,
                tagsJson
            );
        } else {
            await query(`
                INSERT INTO Recipes (id, name, pizzaiolo, source, description, ingredients, instructions, imageUrl, archetype, createdAt, dateAdded, isFavorite, rating, tags)
                VALUES (@id, @name, @pizzaiolo, @source, @description, @ingredients, @instructions, @imageUrl, @archetype, @createdAt, @dateAdded, @isFavorite, @rating, @tags)
            `, {
                id: recipe.id,
                name: recipe.name,
                pizzaiolo: recipe.pizzaiolo || 'Sconosciuto',
                source: recipe.source || '',
                description: recipe.description || '',
                ingredients: ingredientsJson,
                instructions: instructionsJson,
                imageUrl: recipe.imageUrl || '',
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
        const ingredientsJson = JSON.stringify(recipe.ingredients || []);
        const instructionsJson = JSON.stringify(recipe.instructions || []);
        const tagsJson = JSON.stringify(recipe.tags || []);

        if (this.type === 'sqlite') {
            const stmt = this.db.prepare(`
                UPDATE Recipes 
                SET name=?, pizzaiolo=?, source=?, description=?, ingredients=?, instructions=?, 
                    imageUrl=?, archetype=?, isFavorite=?, rating=?, tags=?
                WHERE id = ?
            `);
            stmt.run(
                recipe.name,
                recipe.pizzaiolo || 'Sconosciuto',
                recipe.source || '',
                recipe.description || '',
                ingredientsJson,
                instructionsJson,
                recipe.imageUrl || '',
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
                    ingredients=@ingredients, instructions=@instructions, imageUrl=@imageUrl, 
                    archetype=@archetype, isFavorite=@isFavorite, rating=@rating, tags=@tags
                WHERE id = @id
            `, {
                id,
                name: recipe.name,
                pizzaiolo: recipe.pizzaiolo || 'Sconosciuto',
                source: recipe.source || '',
                description: recipe.description || '',
                ingredients: ingredientsJson,
                instructions: instructionsJson,
                imageUrl: recipe.imageUrl || '',
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
}

export default DatabaseAdapter;
