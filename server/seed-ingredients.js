// Seed Ingredients from JSON file
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

export async function seedIngredients() {
    const db = new Database(dbPath);

    console.log('🌱 Seeding Ingredients...\n');

    // Check if already seeded
    const existing = db.prepare('SELECT COUNT(*) as count FROM Ingredients').get();
    if (existing.count > 0) {
        console.log(`⏭️  Ingredients already seeded (${existing.count} ingredients exist)`);
        db.close();
        return;
    }

    // Load seed data
    const seedFile = path.join(__dirname, 'seed-data-ingredients.json');
    if (!fs.existsSync(seedFile)) {
        console.error('❌ Seed file not found:', seedFile);
        db.close();
        return;
    }

    const seedData = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
    console.log(`Loading ${seedData.count} ingredients from seed...\n`);

    // Get categories
    const categories = db.prepare('SELECT * FROM Categories').all();
    const categoryMap = {};
    categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
    });

    const insertStmt = db.prepare(`
        INSERT INTO Ingredients (id, name, categoryId, subcategory, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let seeded = 0;
    seedData.ingredients.forEach(ing => {
        const categoryId = categoryMap[ing.category];
        if (!categoryId) {
            console.warn(`⚠️  Category not found for ${ing.name}: ${ing.category}`);
            return;
        }

        try {
            insertStmt.run(
                randomUUID(),
                ing.name,
                categoryId,
                ing.subcategory,
                ing.minWeight,
                ing.maxWeight,
                ing.defaultUnit || 'g',
                ing.postBake || 0,
                ing.phase || 'topping',
                ing.season,
                ing.allergens,
                ing.tags,
                ing.isCustom || 0,
                Date.now()
            );
            seeded++;
        } catch (error) {
            console.error(`❌ Error seeding ${ing.name}:`, error.message);
        }
    });

    console.log(`\n✅ Seeded ${seeded}/${seedData.count} ingredients`);
    db.close();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedIngredients();
}
