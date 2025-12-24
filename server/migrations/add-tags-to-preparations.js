import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../antigravipizza.db');

console.log('🔧 Database Migration: Add tags column to Preparations');
console.log('Database path:', dbPath);

const db = new Database(dbPath);

try {
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(Preparations)").all();
    const hasTagsColumn = tableInfo.some(col => col.name === 'tags');

    if (hasTagsColumn) {
        console.log('✅ Column "tags" already exists in Preparations table');
        console.log('Nothing to do.');
    } else {
        console.log('⚙️  Adding "tags" column to Preparations table...');

        // Add the tags column
        db.prepare('ALTER TABLE Preparations ADD COLUMN tags TEXT').run();

        console.log('✅ Column "tags" added successfully!');

        // Verify
        const updatedTableInfo = db.prepare("PRAGMA table_info(Preparations)").all();
        const tagsColumn = updatedTableInfo.find(col => col.name === 'tags');

        if (tagsColumn) {
            console.log('✅ Verification passed: tags column exists');
            console.log('   Column info:', tagsColumn);
        } else {
            console.error('❌ Verification failed: tags column not found after migration');
        }
    }
} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
} finally {
    db.close();
    console.log('\n✅ Migration completed');
}
