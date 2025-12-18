
import DatabaseAdapter from './server/db-adapter.js';

async function clearForSeed() {
    try {
        const dbAdapter = new DatabaseAdapter();
        console.log('🧹 Clearing Categories, Ingredients, and Preparations for fresh seed...');

        if (dbAdapter.type === 'sqlite') {
            dbAdapter.db.prepare('PRAGMA foreign_keys = OFF').run();
            await dbAdapter.clearTable('Categories');
            await dbAdapter.clearTable('Ingredients');
            await dbAdapter.clearTable('Preparations');
            dbAdapter.db.prepare('PRAGMA foreign_keys = ON').run();
        } else {
            // For MSSQL we'd need a different approach, but we are on SQLite
            await dbAdapter.clearTable('Categories');
            await dbAdapter.clearTable('Ingredients');
            await dbAdapter.clearTable('Preparations');
        }
        console.log('✅ Tables cleared.');
        process.exit(0);
    } catch (err) {
        console.error('💥 Error:', err.message);
        process.exit(1);
    }
}

clearForSeed();
