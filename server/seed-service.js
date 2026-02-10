import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import DatabaseAdapter from './db-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Seed all data (categories, ingredients, preparations) using DatabaseAdapter
 * This works with both SQLite and Turso
 */
export async function seedAll() {
    const dbAdapter = new DatabaseAdapter();
    const results = {
        categories: 0,
        ingredients: 0,
        preparations: 0,
        errors: []
    };

    try {
        console.log('🌱 Starting seed process...');

        // 1. Seed Categories
        console.log('📦 Seeding categories...');
        const categories = [
            { name: 'Impasti', icon: '🌾', displayOrder: 1, description: 'Farine, lieviti, acqua, sale, olio per impasti' },
            { name: 'Basi e Salse', icon: '🍅', displayOrder: 2, description: 'Salse base, creme, condimenti liquidi' },
            { name: 'Formaggi', icon: '🧀', displayOrder: 3, description: 'Tutti i formaggi (freschi, stagionati, fusi)' },
            { name: 'Latticini', icon: '🥛', displayOrder: 4, description: 'Prodotti lattiero-caseari non formaggi' },
            { name: 'Carni e Salumi', icon: '🥓', displayOrder: 5, description: 'Carni fresche, salumi, affettati' },
            { name: 'Pesce e Frutti di Mare', icon: '🐟', displayOrder: 6, description: 'Pesce fresco, affumicato, conservato' },
            { name: 'Verdure e Ortaggi', icon: '🥬', displayOrder: 7, description: 'Verdure fresche, grigliate, sott\'olio' },
            { name: 'Erbe e Spezie', icon: '🌿', displayOrder: 8, description: 'Aromi, spezie, erbe fresche e secche' },
            { name: 'Frutta e Frutta Secca', icon: '🥜', displayOrder: 9, description: 'Frutta fresca, secca, semi' },
            { name: 'Altro', icon: '📦', displayOrder: 10, description: 'Ingredienti speciali, miele, aceti, etc.' }
        ];

        // Get existing categories
        const existingCategories = await dbAdapter.getAllCategories();
        const existingCategoryNames = new Set(existingCategories.map(c => c.name));

        for (const cat of categories) {
            if (!existingCategoryNames.has(cat.name)) {
                const categoryData = {
                    id: randomUUID(),
                    name: cat.name,
                    icon: cat.icon,
                    displayOrder: cat.displayOrder,
                    description: cat.description,
                    createdAt: Date.now()
                };

                if (dbAdapter.isSQLite) {
                    const stmt = dbAdapter.db.prepare('INSERT INTO Categories (id, name, icon, displayOrder, description, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
                    stmt.run(categoryData.id, categoryData.name, categoryData.icon, categoryData.displayOrder, categoryData.description, categoryData.createdAt);
                } else {
                    // Turso
                    await dbAdapter.db.execute({
                        sql: 'INSERT INTO Categories (id, name, icon, displayOrder, description, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
                        args: [categoryData.id, categoryData.name, categoryData.icon, categoryData.displayOrder, categoryData.description, categoryData.createdAt]
                    });
                }
                results.categories++;
            }
        }
        console.log(`✅ Seeded ${results.categories} categories`);

        // 2. Seed Ingredients from JSON
        console.log('🥬 Seeding ingredients...');
        const ingredientsFile = path.join(__dirname, 'seed-data-ingredients.json');
        if (fs.existsSync(ingredientsFile)) {
            const seedData = JSON.parse(fs.readFileSync(ingredientsFile, 'utf8'));

            // Get category map
            const allCategories = await dbAdapter.getAllCategories();
            const categoryMap = {};
            allCategories.forEach(cat => {
                categoryMap[cat.name] = cat.id;
            });

            // Get existing ingredients (pass null to get only base data where userId IS NULL)
            const existingIngredients = await dbAdapter.getAllIngredients(null);
            // Use lowercase names for case-insensitive comparison
            const existingIngredientNames = new Set(existingIngredients.map(i => i.name.toLowerCase()));

            for (const ing of seedData.ingredients) {
                if (!existingIngredientNames.has(ing.name.toLowerCase())) {
                    const categoryId = categoryMap[ing.category];
                    if (categoryId) {
                        const ingredientData = {
                            id: randomUUID(),
                            name: ing.name,
                            categoryId: categoryId,
                            subcategory: ing.subcategory || null,
                            minWeight: ing.minWeight || null,
                            maxWeight: ing.maxWeight || null,
                            defaultUnit: ing.defaultUnit || 'g',
                            postBake: ing.postBake ? 1 : 0,
                            phase: ing.phase || 'topping',
                            season: ing.season ? JSON.stringify(ing.season) : null,
                            allergens: ing.allergens ? JSON.stringify(ing.allergens) : '[]',
                            tags: ing.tags ? JSON.stringify(ing.tags) : '[]',
                            isCustom: ing.isCustom ? 1 : 0,
                            dateAdded: Date.now()
                        };

                        if (dbAdapter.isSQLite) {
                            const stmt = dbAdapter.db.prepare('INSERT INTO Ingredients (id, name, categoryId, subcategory, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                            stmt.run(ingredientData.id, ingredientData.name, ingredientData.categoryId, ingredientData.subcategory, ingredientData.minWeight, ingredientData.maxWeight, ingredientData.defaultUnit, ingredientData.postBake, ingredientData.phase, ingredientData.season, ingredientData.allergens, ingredientData.tags, ingredientData.isCustom, ingredientData.dateAdded, null);
                        } else {
                            // Turso
                            await dbAdapter.db.execute({
                                sql: 'INSERT INTO Ingredients (id, name, categoryId, subcategory, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                args: [ingredientData.id, ingredientData.name, ingredientData.categoryId, ingredientData.subcategory, ingredientData.minWeight, ingredientData.maxWeight, ingredientData.defaultUnit, ingredientData.postBake, ingredientData.phase, ingredientData.season, ingredientData.allergens, ingredientData.tags, ingredientData.isCustom, ingredientData.dateAdded, null]
                            });
                        }
                        results.ingredients++;
                    }
                }
            }
        }
        console.log(`✅ Seeded ${results.ingredients} ingredients`);

        // 3. Seed Preparations from JSON
        console.log('🍽️ Seeding preparations...');
        const preparationsFile = path.join(__dirname, 'seed-data-preparations.json');
        if (fs.existsSync(preparationsFile)) {
            const seedData = JSON.parse(fs.readFileSync(preparationsFile, 'utf8'));

            // Get existing preparations (pass null to get only base data where userId IS NULL)
            const existingPreparations = await dbAdapter.getAllPreparations(null);
            // Use lowercase names for case-insensitive comparison
            const existingPreparationNames = new Set(existingPreparations.map(p => p.name.toLowerCase()));

            for (const prep of seedData.preparations) {
                if (!existingPreparationNames.has(prep.name.toLowerCase())) {
                    const preparationData = {
                        id: randomUUID(),
                        name: prep.name,
                        category: prep.category,
                        description: prep.description || '',
                        yield: prep.yield || 4,
                        prepTime: prep.prepTime || '',
                        difficulty: prep.difficulty || 'Media',
                        ingredients: prep.ingredients || '[]',
                        instructions: prep.instructions || '[]',
                        tips: prep.tips || '[]',
                        dateAdded: Date.now(),
                        isCustom: prep.isCustom ? 1 : 0
                    };

                    if (dbAdapter.isSQLite) {
                        const stmt = dbAdapter.db.prepare('INSERT INTO Preparations (id, name, category, description, yield, prepTime, difficulty, ingredients, instructions, tips, dateAdded, isCustom, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                        stmt.run(preparationData.id, preparationData.name, preparationData.category, preparationData.description, preparationData.yield, preparationData.prepTime, preparationData.difficulty, preparationData.ingredients, preparationData.instructions, preparationData.tips, preparationData.dateAdded, preparationData.isCustom, null);
                    } else {
                        // Turso (libSQL) - use [yield] to avoid reserved word issues
                        await dbAdapter.db.execute({
                            sql: 'INSERT INTO Preparations (id, name, category, description, [yield], prepTime, difficulty, ingredients, instructions, tips, dateAdded, isCustom, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            args: [preparationData.id, preparationData.name, preparationData.category, preparationData.description, preparationData.yield, preparationData.prepTime, preparationData.difficulty, preparationData.ingredients, preparationData.instructions, preparationData.tips, preparationData.dateAdded, preparationData.isCustom, null]
                        });
                    }
                    results.preparations++;
                }
            }
        }
        console.log(`✅ Seeded ${results.preparations} preparations`);

        console.log('🎉 Seed complete!');
        return results;
    } catch (error) {
        console.error('❌ Seed error:', error);
        results.errors.push(error.message);
        return results;
    }
}
