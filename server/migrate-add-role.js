
import { getDb } from './db.js';
import DatabaseAdapter from './db-adapter.js';

(async () => {
    try {
        const db = getDb();
        const adapter = new DatabaseAdapter();
        const isTurso = adapter.isTurso;

        console.log('--- 🛠️ MIGRATION: ADD ROLE TO USERS ---');
        console.log(`Database Type: ${isTurso ? 'Turso (Remote)' : 'SQLite (Local)'}`);

        // Check if column exists
        let columnExists = false;
        try {
            if (isTurso) {
                // Turso doesn't support PRAGMA table_info easily via http sometimes, but let's try selecting the column
                try {
                    await db.execute('SELECT role FROM Users LIMIT 1');
                    columnExists = true;
                } catch (e) {
                    columnExists = false;
                }
            } else {
                const info = db.prepare("PRAGMA table_info(Users)").all();
                columnExists = info.some(col => col.name === 'role');
            }
        } catch (err) {
            console.log('Error checking column:', err.message);
        }

        if (columnExists) {
            console.log('✅ Column "role" already exists. Skipping.');
            return;
        }

        console.log('🔄 Adding "role" column...');

        if (isTurso) {
            await db.execute("ALTER TABLE Users ADD COLUMN role TEXT DEFAULT 'user'");
        } else {
            db.prepare("ALTER TABLE Users ADD COLUMN role TEXT DEFAULT 'user'").run();
        }

        console.log('✅ Migration successful! Column "role" added.');

    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
})();
