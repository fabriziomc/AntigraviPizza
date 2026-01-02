// Migration: Add recipeSource and archetypeUsed fields to Recipes table
import { getDb } from './db.js';

console.log('🔄 Running migration: Add recipeSource and archetypeUsed to Recipes...\\n');

const db = getDb();
const isSQLite = typeof db?.prepare === 'function';

try {
    if (isSQLite) {
        // SQLite migration
        console.log('📊 Database type: SQLite');

        // Check if columns already exist
        const tableInfo = db.prepare("PRAGMA table_info(Recipes)").all();
        const hasRecipeSource = tableInfo.some(col => col.name === 'recipeSource');
        const hasArchetypeUsed = tableInfo.some(col => col.name === 'archetypeUsed');

        if (!hasRecipeSource) {
            db.prepare('ALTER TABLE Recipes ADD COLUMN recipeSource TEXT').run();
            console.log('✅ Added column: recipeSource');
        } else {
            console.log('⏭️ Column recipeSource already exists');
        }

        if (!hasArchetypeUsed) {
            db.prepare('ALTER TABLE Recipes ADD COLUMN archetypeUsed TEXT').run();
            console.log('✅ Added column: archetypeUsed');
        } else {
            console.log('⏭️  Column archetypeUsed already exists');
        }

    } else {
        // Turso migration
        console.log('📊 Database type: Turso');

        // Turso: Try to add columns (will fail silently if they exist)
        try {
            await db.execute('ALTER TABLE Recipes ADD COLUMN recipeSource TEXT');
            console.log('✅ Added column: recipeSource');
        } catch (err) {
            if (err.message && err.message.includes('duplicate column')) {
                console.log('⏭️ Column recipeSource already exists');
            } else {
                throw err;
            }
        }

        try {
            await db.execute('ALTER TABLE Recipes ADD COLUMN archetypeUsed TEXT');
            console.log('✅ Added column: archetypeUsed');
        } catch (err) {
            if (err.message && err.message.includes('duplicate column')) {
                console.log('⏭️ Column archetypeUsed already exists');
            } else {
                throw err;
            }
        }
    }

    console.log('\\n✅ Migration completed successfully!\\n');

} catch (error) {
    console.error('\\n❌ Migration failed:', error.message);
    throw error;
}

if (isSQLite) {
    db.close();
}
