import { getDb } from '../db.js';

/**
 * Migration script to update Settings table
 * - Adds maxOvenTemp column
 * - Adds geminiApiKey column
 */

async function runMigration() {
    console.log('🔄 Starting settings update migration...');

    const db = getDb();
    const isTurso = typeof db?.execute === 'function';

    try {
        const columnsToAdd = [
            { name: 'maxOvenTemp', type: 'INTEGER DEFAULT 250' },
            { name: 'geminiApiKey', type: 'TEXT' },
            { name: 'segmindApiKey', type: 'TEXT' } // Added segmind too as it was in imageProviders.js
        ];

        for (const col of columnsToAdd) {
            console.log(`📝 Adding ${col.name} to Settings...`);

            // Check if column already exists
            let hasColumn = false;
            if (isTurso) {
                const result = await db.execute(`PRAGMA table_info(Settings)`);
                hasColumn = result.rows.some(row => row.name === col.name);
            } else {
                const result = db.prepare(`PRAGMA table_info(Settings)`).all();
                hasColumn = result.some(row => row.name === col.name);
            }

            if (!hasColumn) {
                const alterTable = `ALTER TABLE Settings ADD COLUMN ${col.name} ${col.type}`;

                if (isTurso) {
                    await db.execute(alterTable);
                } else {
                    db.exec(alterTable);
                }
                console.log(`✅ ${col.name} added to Settings`);
            } else {
                console.log(`⏭️  Settings already has ${col.name} column`);
            }
        }

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration if called directly
console.log('🏃 Attempting to run migration...');
runMigration()
    .then(() => {
        console.log('✅ Migration process finished');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Migration process failed:', err);
        process.exit(1);
    });

export { runMigration };
