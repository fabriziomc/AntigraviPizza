import { getDb, getDbType } from '../db.js';

console.log('🔧 Database Migration: Add isVotingOpen column to PizzaNights');

const db = getDb();
const type = getDbType();

console.log(`📊 Database type: ${type}`);

async function runMigration() {
    try {
        if (type === 'sqlite') {
            // Check if column already exists
            const tableInfo = db.prepare("PRAGMA table_info(PizzaNights)").all();
            const hasColumn = tableInfo.some(col => col.name === 'isVotingOpen');

            if (hasColumn) {
                console.log('✅ Column "isVotingOpen" already exists in PizzaNights table');
            } else {
                console.log('⚙️  Adding "isVotingOpen" column to PizzaNights table...');
                db.prepare('ALTER TABLE PizzaNights ADD COLUMN isVotingOpen INTEGER DEFAULT 0').run();
                console.log('✅ Column "isVotingOpen" added successfully!');
            }
        } else {
            // Turso
            try {
                console.log('⚙️  Attempting to add "isVotingOpen" column to PizzaNights table (Turso)...');
                await db.execute('ALTER TABLE PizzaNights ADD COLUMN isVotingOpen INTEGER DEFAULT 0');
                console.log('✅ Column "isVotingOpen" added successfully!');
            } catch (error) {
                if (error.message.includes('duplicate column name') || error.message.includes('already exists')) {
                    console.log('✅ Column "isVotingOpen" already exists (detected via error)');
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
