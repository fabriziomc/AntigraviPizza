import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get database path
const dbPath = process.env.NODE_ENV === 'production'
    ? '/app/data/antigravipizza.db'
    : path.join(__dirname, '..', 'antigravipizza.db');

export async function seedAll() {
    const db = new Database(dbPath);
    const results = {
        categories: 0,
        ingredients: 0,
        preparations: 0,
        errors: []
    };

    try {
        // Seed Categories
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

        const catStmt = db.prepare('INSERT OR IGNORE INTO Categories (id, name, icon, displayOrder, description, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
        categories.forEach(cat => {
            catStmt.run(randomUUID(), cat.name, cat.icon, cat.displayOrder, cat.description, Date.now());
            results.categories++;
        });

        // Seed Ingredients from JSON
        const ingredientsFile = path.join(__dirname, 'seed-data-ingredients.json');
        if (fs.existsSync(ingredientsFile)) {
            const seedData = JSON.parse(fs.readFileSync(ingredientsFile, 'utf8'));
            const categoryMap = {};
            db.prepare('SELECT * FROM Categories').all().forEach(cat => {
                categoryMap[cat.name] = cat.id;
            });

            const ingStmt = db.prepare('INSERT OR IGNORE INTO Ingredients (id, name, categoryId, subcategory, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

            seedData.ingredients.forEach(ing => {
                const categoryId = categoryMap[ing.category];
                if (categoryId) {
                    ingStmt.run(randomUUID(), ing.name, categoryId, ing.subcategory, ing.minWeight, ing.maxWeight, ing.defaultUnit || 'g', ing.postBake || 0, ing.phase || 'topping', ing.season, ing.allergens, ing.tags, ing.isCustom || 0, Date.now());
                    results.ingredients++;
                }
            });
        }

        // Seed Preparations from JSON
        const preparationsFile = path.join(__dirname, 'seed-data-preparations.json');
        if (fs.existsSync(preparationsFile)) {
            const seedData = JSON.parse(fs.readFileSync(preparationsFile, 'utf8'));
            const prepStmt = db.prepare('INSERT OR IGNORE INTO Preparations (id, name, category, description, yield, prepTime, difficulty, ingredients, instructions, tips, dateAdded, isCustom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

            seedData.preparations.forEach(prep => {
                prepStmt.run(randomUUID(), prep.name, prep.category, prep.description || '', prep.yield || 4, prep.prepTime || '', prep.difficulty || 'Media', prep.ingredients, prep.instructions, prep.tips, Date.now(), prep.isCustom || 0);
                results.preparations++;
            });
        }

        db.close();
        return results;
    } catch (error) {
        results.errors.push(error.message);
        db.close();
        return results;
    }
}
