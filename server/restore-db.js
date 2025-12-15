// ============================================
// DATABASE RESTORE SCRIPT
// ============================================
// Restores database from JSON backup

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use same path logic as db.js
const DB_PATH = path.join(__dirname, '..', 'antigravipizza.db');
const BACKUP_FILE = path.join(__dirname, '..', 'backups', 'latest-backup.json');

async function restoreDatabase() {
    console.log('📥 Starting database restore...');
    console.log('📂 Database path:', DB_PATH);
    console.log('📁 Backup file:', BACKUP_FILE);

    try {
        // Check if backup file exists
        if (!fs.existsSync(BACKUP_FILE)) {
            console.log('⚠️  No backup file found at:', BACKUP_FILE);
            return { success: false, message: 'No backup file found' };
        }

        // Check if database exists
        if (!fs.existsSync(DB_PATH)) {
            console.log('⚠️  Database file not found at:', DB_PATH);
            console.log('⚠️  Database must be created first by the server');
            return { success: false, message: 'Database not found' };
        }

        // Read backup file
        const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
        console.log('📂 Loaded backup from:', new Date(backupData.timestamp).toISOString());
        console.log('📋 Backup version:', backupData.version);

        // Connect to database
        const db = new Database(DB_PATH);
        console.log('📂 Connected to database:', DB_PATH);

        // Start transaction for atomic restore
        db.prepare('BEGIN TRANSACTION').run();

        try {
            let totalRestored = 0;

            // Restore Recipes
            if (backupData.data.recipes && backupData.data.recipes.length > 0) {
                const stmt = db.prepare(`
                    INSERT OR REPLACE INTO Recipes 
                    (id, name, description, baseIngredients, preparations, instructions, tags, pizzaiolo, dateAdded, isFavorite, source, doughType)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                for (const recipe of backupData.data.recipes) {
                    stmt.run(
                        recipe.id,
                        recipe.name,
                        recipe.description,
                        recipe.baseIngredients,
                        recipe.preparations,
                        recipe.instructions,
                        recipe.tags,
                        recipe.pizzaiolo,
                        recipe.dateAdded,
                        recipe.isFavorite || 0,
                        recipe.source,
                        recipe.doughType
                    );
                }
                totalRestored += backupData.data.recipes.length;
                console.log(`  ✓ Restored ${backupData.data.recipes.length} recipes`);
            }

            // Restore Pizza Nights
            if (backupData.data.pizzaNights && backupData.data.pizzaNights.length > 0) {
                const stmt = db.prepare(`
                    INSERT OR REPLACE INTO PizzaNights 
                    (id, name, date, guestCount, selectedPizzas, selectedGuests, selectedDough, notes, status, availableIngredients, dateAdded)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                for (const night of backupData.data.pizzaNights) {
                    stmt.run(
                        night.id,
                        night.name,
                        night.date,
                        night.guestCount,
                        night.selectedPizzas,
                        night.selectedGuests,
                        night.selectedDough,
                        night.notes,
                        night.status,
                        night.availableIngredients,
                        night.dateAdded
                    );
                }
                totalRestored += backupData.data.pizzaNights.length;
                console.log(`  ✓ Restored ${backupData.data.pizzaNights.length} pizza nights`);
            }

            // Restore Guests
            if (backupData.data.guests && backupData.data.guests.length > 0) {
                const stmt = db.prepare(`
                    INSERT OR REPLACE INTO Guests (id, name, dateAdded)
                    VALUES (?, ?, ?)
                `);

                for (const guest of backupData.data.guests) {
                    stmt.run(guest.id, guest.name, guest.dateAdded);
                }
                totalRestored += backupData.data.guests.length;
                console.log(`  ✓ Restored ${backupData.data.guests.length} guests`);
            }

            // Note: Ingredients and Preparations are seeded, not restored from backup
            // to avoid conflicts with updated seed data

            db.prepare('COMMIT').run();
            console.log(`✅ Restore completed successfully!`);
            console.log(`📊 Total records restored: ${totalRestored}`);

            db.close();

            return {
                success: true,
                totalRestored,
                timestamp: backupData.timestamp,
                counts: {
                    recipes: backupData.data.recipes?.length || 0,
                    pizzaNights: backupData.data.pizzaNights?.length || 0,
                    guests: backupData.data.guests?.length || 0
                }
            };

        } catch (error) {
            db.prepare('ROLLBACK').run();
            db.close();
            throw error;
        }

    } catch (error) {
        console.error('❌ Restore failed:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    }
}

// Restore from backup data (for API use with uploaded file)
async function restoreFromData(backupData) {
    console.log('📥 Starting database restore from uploaded data...');
    console.log('📂 Database path:', DB_PATH);

    try {
        // Normalize backup format: accept both full format (with metadata) and data-only format
        if (!backupData.data && (backupData.recipes || backupData.pizzaNights || backupData.guests)) {
            // Data-only format, wrap it with metadata
            backupData = {
                version: '1.0',
                timestamp: Date.now(),
                data: backupData
            };
        }

        if (!backupData || !backupData.data) {
            throw new Error('Invalid backup data format');
        }

        console.log('📂 Loaded backup from:', new Date(backupData.timestamp).toISOString());
        console.log('📋 Backup version:', backupData.version);

        // Check if database exists
        if (!fs.existsSync(DB_PATH)) {
            console.log('⚠️  Database file not found at:', DB_PATH);
            console.log('⚠️  Database must be created first by the server');
            return { success: false, message: 'Database not found' };
        }

        // Connect to database
        const db = new Database(DB_PATH);
        console.log('📂 Connected to database:', DB_PATH);

        // Start transaction for atomic restore
        db.prepare('BEGIN TRANSACTION').run();

        try {
            let totalRestored = 0;

            // Restore Recipes
            if (backupData.data.recipes && backupData.data.recipes.length > 0) {
                const stmt = db.prepare(`
                    INSERT OR REPLACE INTO Recipes 
                    (id, name, description, baseIngredients, preparations, instructions, tags, pizzaiolo, dateAdded, isFavorite, source, doughType)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                for (const recipe of backupData.data.recipes) {
                    stmt.run(
                        recipe.id,
                        recipe.name,
                        recipe.description,
                        recipe.baseIngredients,
                        recipe.preparations,
                        recipe.instructions,
                        recipe.tags,
                        recipe.pizzaiolo,
                        recipe.dateAdded,
                        recipe.isFavorite || 0,
                        recipe.source,
                        recipe.doughType
                    );
                }
                totalRestored += backupData.data.recipes.length;
                console.log(`  ✓ Restored ${backupData.data.recipes.length} recipes`);
            }

            // Restore Pizza Nights
            if (backupData.data.pizzaNights && backupData.data.pizzaNights.length > 0) {
                const stmt = db.prepare(`
                    INSERT OR REPLACE INTO PizzaNights 
                    (id, name, date, guestCount, selectedPizzas, selectedGuests, selectedDough, notes, status, availableIngredients, dateAdded)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                for (const night of backupData.data.pizzaNights) {
                    stmt.run(
                        night.id,
                        night.name,
                        night.date,
                        night.guestCount,
                        night.selectedPizzas,
                        night.selectedGuests,
                        night.selectedDough,
                        night.notes,
                        night.status,
                        night.availableIngredients,
                        night.dateAdded
                    );
                }
                totalRestored += backupData.data.pizzaNights.length;
                console.log(`  ✓ Restored ${backupData.data.pizzaNights.length} pizza nights`);
            }

            // Restore Guests
            if (backupData.data.guests && backupData.data.guests.length > 0) {
                const stmt = db.prepare(`
                    INSERT OR REPLACE INTO Guests (id, name, dateAdded)
                    VALUES (?, ?, ?)
                `);

                for (const guest of backupData.data.guests) {
                    stmt.run(guest.id, guest.name, guest.dateAdded);
                }
                totalRestored += backupData.data.guests.length;
                console.log(`  ✓ Restored ${backupData.data.guests.length} guests`);
            }

            db.prepare('COMMIT').run();
            console.log(`✅ Restore completed successfully!`);
            console.log(`📊 Total records restored: ${totalRestored}`);

            db.close();

            return {
                success: true,
                totalRestored,
                timestamp: backupData.timestamp,
                counts: {
                    recipes: backupData.data.recipes?.length || 0,
                    pizzaNights: backupData.data.pizzaNights?.length || 0,
                    guests: backupData.data.guests?.length || 0
                }
            };

        } catch (error) {
            db.prepare('ROLLBACK').run();
            db.close();
            throw error;
        }

    } catch (error) {
        console.error('❌ Restore failed:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    }
}

// Export for API use
export { restoreDatabase, restoreFromData };

// Run restore if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    restoreDatabase()
        .then(() => {
            console.log('\n🎉 Restore process completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Restore process failed:', error);
            process.exit(1);
        });
}
