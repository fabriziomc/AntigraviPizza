// Seed Preparations from JSON file
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

export async function seedPreparations() {
    const db = new Database(dbPath);

    console.log('🌱 Seeding Preparations...\n');

    // Check if already seeded
    const existing = db.prepare('SELECT COUNT(*) as count FROM Preparations').get();
    if (existing.count > 0) {
        console.log(`⏭️  Preparations already seeded (${existing.count} preparations exist)`);
        db.close();
        return;
    }

    // Load seed data
    const seedFile = path.join(__dirname, 'seed-data-preparations.json');
    if (!fs.existsSync(seedFile)) {
        console.error('❌ Seed file not found:', seedFile);
        db.close();
        return;
    }

    const seedData = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
    console.log(`Loading ${seedData.count} preparations from seed...\n`);

    const insertStmt = db.prepare(`
        INSERT INTO Preparations (id, name, category, description, yield, prepTime, difficulty, ingredients, instructions, tips, dateAdded, isCustom)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let seeded = 0;
    seedData.preparations.forEach(prep => {
        try {
            insertStmt.run(
                randomUUID(),
                prep.name,
                prep.category,
                prep.description || '',
                prep.yield || 4,
                prep.prepTime || '',
                prep.difficulty || 'Media',
                prep.ingredients, // Already JSON string
                prep.instructions,
                prep.tips,
                Date.now(),
                prep.isCustom || 0
            );
            seeded++;
        } catch (error) {
            console.error(`❌ Error seeding ${prep.name}:`, error.message);
        }
    });

    console.log(`\n✅ Seeded ${seeded}/${seedData.count} preparations`);
    db.close();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedPreparations();
}
