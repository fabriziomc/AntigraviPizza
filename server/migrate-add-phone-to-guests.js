import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🔧 Starting database migration: Adding phone column to Guests table...\n');

try {
    // Check if phone column already exists
    const tableInfo = db.prepare("PRAGMA table_info(Guests)").all();
    const hasPhoneColumn = tableInfo.some(col => col.name === 'phone');

    if (hasPhoneColumn) {
        console.log('✅ Phone column already exists in Guests table. No migration needed.');
    } else {
        // Add phone column
        db.prepare('ALTER TABLE Guests ADD COLUMN phone TEXT').run();
        console.log('✅ Successfully added phone column to Guests table');
    }

    // Verify the change
    const updatedInfo = db.prepare("PRAGMA table_info(Guests)").all();
    console.log('\n📋 Current Guests table schema:');
    updatedInfo.forEach(col => {
        console.log(`   - ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
    });

    console.log('\n✅ Migration completed successfully!');
} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
} finally {
    db.close();
}
