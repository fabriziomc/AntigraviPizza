// Helper functions for expanding ingredient references
import { getDb, getDbType } from './db.js';

const dbType = getDbType();
const db = getDb();

/**
 * Expand ingredient references (ingredientId) to full ingredient objects
 * @param {Array} ingredients - Array of {ingredientId, quantity, unit, ...}
 * @returns {Array} - Array of full ingredient objects with name, category, etc.
 */
export async function expandIngredients(ingredients) {
    if (!ingredients || ingredients.length === 0) return [];

    const expanded = [];

    for (const ing of ingredients) {
        // If it already has a name, it's already expanded
        if (ing.name) {
            expanded.push(ing);
            continue;
        }

        // Otherwise, fetch from database
        if (ing.ingredientId) {
            try {
                const stmt = db.prepare(`
                    SELECT i.*, c.name as categoryName, c.icon as categoryIcon
                    FROM Ingredients i
                    LEFT JOIN Categories c ON i.categoryId = c.id
                    WHERE i.id = ?
                `);
                const ingredient = stmt.get(ing.ingredientId);

                if (ingredient) {
                    expanded.push({
                        ...ing,
                        name: ingredient.name,
                        category: ingredient.categoryName,
                        categoryIcon: ingredient.categoryIcon,
                        defaultUnit: ingredient.defaultUnit
                    });
                } else {
                    // Ingredient not found, keep original
                    console.warn(`Ingredient not found: ${ing.ingredientId}`);
                    expanded.push(ing);
                }
            } catch (error) {
                console.error(`Error expanding ingredient ${ing.ingredientId}:`, error);
                expanded.push(ing);
            }
        } else {
            // No ingredientId, keep as is
            expanded.push(ing);
        }
    }

    return expanded;
}

/**
 * Get all categories
 */
export function getAllCategories() {
    if (dbType === 'sqlite') {
        const stmt = db.prepare('SELECT * FROM Categories ORDER BY displayOrder');
        return stmt.all();
    } else {
        // SQL Server not implemented yet
        return [];
    }
}

/**
 * Get category by ID
 */
export function getCategoryById(id) {
    if (dbType === 'sqlite') {
        const stmt = db.prepare('SELECT * FROM Categories WHERE id = ?');
        return stmt.get(id);
    } else {
        // SQL Server not implemented yet
        return null;
    }
}
