// ============================================
// DATABASE BACKUP SCRIPT
// ============================================
// Exports entire database to JSON format for backup

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.SQLITE_DB_PATH || path.join(__dirname, '..', 'antigravipizza.db');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const BACKUP_FILE = path.join(BACKUP_DIR, 'latest-backup.json');

async function backupDatabase() {
    console.log('💾 Starting database backup...');

    try {
        // Ensure backup directory exists
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
            console.log('📁 Created backups directory');
        }

        // Connect to database
        const db = new Database(DB_PATH, { readonly: true });
        console.log('📂 Connected to database:', DB_PATH);

        // Export all tables
        const backup = {
            version: '1.0',
            timestamp: Date.now(),
            date: new Date().toISOString(),
            data: {}
        };

        // Get all recipes
        const recipes = db.prepare('SELECT * FROM Recipes').all();
        backup.data.recipes = recipes;
        console.log(`  ✓ Exported ${recipes.length} recipes`);

        // Get all pizza nights
        const pizzaNights = db.prepare('SELECT * FROM PizzaNights').all();
        backup.data.pizzaNights = pizzaNights;
        console.log(`  ✓ Exported ${pizzaNights.length} pizza nights`);

        // Get all guests
        const guests = db.prepare('SELECT * FROM Guests').all();
        backup.data.guests = guests;
        console.log(`  ✓ Exported ${guests.length} guests`);

        // Get all ingredients
        const ingredients = db.prepare('SELECT * FROM Ingredients').all();
        backup.data.ingredients = ingredients;
        console.log(`  ✓ Exported ${ingredients.length} ingredients`);

        // Get all preparations
        const preparations = db.prepare('SELECT * FROM Preparations').all();
        backup.data.preparations = preparations;
        console.log(`  ✓ Exported ${preparations.length} preparations`);

        // Get archetype weights if table exists
        try {
            const weights = db.prepare('SELECT * FROM ArchetypeWeights').all();
            backup.data.archetypeWeights = weights;
            console.log(`  ✓ Exported ${weights.length} archetype weights`);
        } catch (e) {
            console.log('  ⚠ ArchetypeWeights table not found, skipping');
            backup.data.archetypeWeights = [];
        }

        db.close();

        // Write backup to file
        fs.writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2), 'utf8');

        const fileSize = (fs.statSync(BACKUP_FILE).size / 1024).toFixed(2);
        console.log(`✅ Backup completed successfully!`);
        console.log(`📦 Backup file: ${BACKUP_FILE}`);
        console.log(`📊 File size: ${fileSize} KB`);
        console.log(`🕒 Timestamp: ${backup.date}`);

        return {
            success: true,
            file: BACKUP_FILE,
            size: fileSize,
            timestamp: backup.timestamp,
            counts: {
                recipes: recipes.length,
                pizzaNights: pizzaNights.length,
                guests: guests.length,
                ingredients: ingredients.length,
                preparations: preparations.length
            }
        };

    } catch (error) {
        console.error('❌ Backup failed:', error.message);
        throw error;
    }
}

// Export for API use
export { backupDatabase };

// Run backup if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    backupDatabase()
        .then(() => {
            console.log('\n🎉 Backup process completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Backup process failed:', error);
            process.exit(1);
        });
}
