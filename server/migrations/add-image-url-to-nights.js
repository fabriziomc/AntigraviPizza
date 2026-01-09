import { getDb, getDbType } from '../db.js';

console.log('🔧 Database Migration: Add imageUrl column to PizzaNights');

const db = getDb();
const type = getDbType();

console.log(`📊 Database type: ${type}`);

async function runMigration() {
    try {
        if (type === 'sqlite') {
            // Check if column already exists
            const tableInfo = db.prepare("PRAGMA table_info(PizzaNights)").all();
            const hasColumn = tableInfo.some(col => col.name === 'imageUrl');

            if (hasColumn) {
                console.log('✅ Column "imageUrl" already exists in PizzaNights table');
            } else {
                console.log('⚙️  Adding "imageUrl" column to PizzaNights table...');
                db.prepare('ALTER TABLE PizzaNights ADD COLUMN imageUrl TEXT').run();
                console.log('✅ Column "imageUrl" added successfully!');
            }
        } else {
            // Turso
            // For Turso/LibSQL we can't easily check PRAGMA table_info in the same way depending on client version
            // But we can try to Select it, or just try to ADD COLUMN and catch error if it exists

            try {
                console.log('⚙️  Attempting to add "imageUrl" column to PizzaNights table (Turso)...');
                await db.execute('ALTER TABLE PizzaNights ADD COLUMN imageUrl TEXT');
                console.log('✅ Column "imageUrl" added successfully!');
            } catch (error) {
                if (error.message.includes('duplicate column name') || error.message.includes('already exists')) {
                    console.log('✅ Column "imageUrl" already exists (detected via error)');
                } else {
                    throw error;
                }
            }
        }
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

await runMigration();
console.log('\n✅ Migration completed');
process.exit(0);
