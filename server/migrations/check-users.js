import { getDb } from '../db.js';

async function checkTables() {
    console.log('🔍 Checking database tables...');

    const db = getDb();
    const isTurso = typeof db?.execute === 'function';

    try {
        // Check if Users table exists
        if (isTurso) {
            const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Users'");
            console.log('Users table exists:', result.rows.length > 0);

            if (result.rows.length > 0) {
                const users = await db.execute('SELECT id, email, name FROM Users');
                console.log('Users in database:', users.rows);
            }

            // Check Settings table
            const settingsResult = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Settings'");
            console.log('Settings table exists:', settingsResult.rows.length > 0);

        } else {
            const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='Users'").all();
            console.log('Users table exists:', result.length > 0);

            if (result.length > 0) {
                const users = db.prepare('SELECT id, email, name FROM Users').all();
                console.log('Users in database:', users);
            }
        }

    } catch (error) {
        console.error('❌ Error checking tables:', error);
    }
}

checkTables()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
