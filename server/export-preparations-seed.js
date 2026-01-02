// Export preparations for seed
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('📦 Exporting preparations for seed...\n');

const preparations = db.prepare('SELECT * FROM Preparations ORDER BY name').all();

console.log(`Found ${preparations.length} preparations\n`);

const seedData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    count: preparations.length,
    preparations: preparations.map(prep => ({
        name: prep.name,
        category: prep.category,
        description: prep.description,
        yield: prep.yield,
        prepTime: prep.prepTime,
        difficulty: prep.difficulty,
        ingredients: prep.ingredients, // Keep as JSON string
        instructions: prep.instructions,
        tips: prep.tips,
        isCustom: prep.isCustom
    }))
};

const seedFile = path.join(__dirname, 'seed-data-preparations.json');
fs.writeFileSync(seedFile, JSON.stringify(seedData, null, 2));

console.log(`✅ Exported to: ${seedFile}`);

db.close();
