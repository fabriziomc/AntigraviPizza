// Migration script to add selectedDough column to PizzaNights table
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

console.log('🔧 Starting migration: Add selectedDough column to PizzaNights table');

try {
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(PizzaNights)").all();
    const hasSelectedDough = tableInfo.some(col => col.name === 'selectedDough');

    if (hasSelectedDough) {
        console.log('✅ Column selectedDough already exists, skipping migration');
    } else {
        // Add the column
        db.prepare('ALTER TABLE PizzaNights ADD COLUMN selectedDough TEXT').run();
        console.log('✅ Successfully added selectedDough column to PizzaNights table');
    }

    // Verify the column was added
    const updatedTableInfo = db.prepare("PRAGMA table_info(PizzaNights)").all();
    console.log('\n📋 Current PizzaNights table schema:');
    updatedTableInfo.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
    });

} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
} finally {
    db.close();
}

console.log('\n🎉 Migration completed successfully!');
