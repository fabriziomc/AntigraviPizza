import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.NODE_ENV === 'production'
    ? '/app/data/antigravipizza.db'
    : path.join(__dirname, '..', 'antigravipizza.db');

const db = new Database(dbPath);

console.log('🔧 Running migration: Add dateAdded to PizzaNights');

try {
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(PizzaNights)").all();
    const hasDateAdded = tableInfo.some(col => col.name === 'dateAdded');

    if (hasDateAdded) {
        console.log('✅ Column dateAdded already exists in PizzaNights table');
    } else {
        // Add the column
        db.prepare('ALTER TABLE PizzaNights ADD COLUMN dateAdded INTEGER').run();
        console.log('✅ Added dateAdded column to PizzaNights table');
    }

    db.close();
    console.log('✅ Migration completed successfully');
} catch (error) {
    console.error('❌ Migration failed:', error);
    db.close();
    process.exit(1);
}
