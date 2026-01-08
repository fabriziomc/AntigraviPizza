
import { getDb } from './db.js';

async function migrate() {
    const db = getDb();
    console.log('🔄 Starting migration: Add recipeUrl to Preparations table...');

    // Detect DB type (SQLite vs Turso)
    const isSQLite = typeof db.prepare === 'function';
    const isTurso = typeof db.execute === 'function';

    try {
        if (isSQLite) {
            console.log('📦 Detected SQLite database');

            // Check if column exists
            const tableInfo = db.prepare('PRAGMA table_info(Preparations)').all();
            const hasColumn = tableInfo.some(col => col.name === 'recipeUrl');

            if (hasColumn) {
                console.log('✅ Column recipeUrl already exists. Skipping.');
            } else {
                console.log('➕ Adding recipeUrl column...');
                db.prepare('ALTER TABLE Preparations ADD COLUMN recipeUrl TEXT').run();
                console.log('✅ Column added successfully.');
            }

        } else if (isTurso) {
            console.log('☁️ Detected Turso database');

            // Check if column exists (using a different approach for LibSQL/Turso if PRAGMA is tricky via http)
            // But usually we can just try to select it limit 0, or catch the error on add.
            // Let's try PRAGMA first.
            try {
                const result = await db.execute('PRAGMA table_info(Preparations)');
                const hasColumn = result.rows.some(col => col.name === 'recipeUrl');

                if (hasColumn) {
                    console.log('✅ Column recipeUrl already exists. Skipping.');
                } else {
                    console.log('➕ Adding recipeUrl column...');
                    await db.execute('ALTER TABLE Preparations ADD COLUMN recipeUrl TEXT');
                    console.log('✅ Column added successfully.');
                }
            } catch (err) {
                console.error('⚠️ Error checking/adding column in Turso:', err.message);
                // Fallback: Try adding it blindly? No, safer to fail and investigate if check fails.
                throw err;
            }
        } else {
            console.error('❌ Unknown database type');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
