
import { getDb } from '../../server/db.js';
import DatabaseAdapter from '../../server/db-adapter.js';

(async () => {
    try {
        const db = getDb();
        const adapter = new DatabaseAdapter();
        const isTurso = adapter.isTurso;

        console.log('--- 🔍 USERS DEBUG ---');
        console.log(`Type: ${isTurso ? 'Turso (Remote)' : 'SQLite (Local)'}`);

        // 1. Check Schema
        console.log('\n1. Schema Check:');
        let userTableExists = false;
        try {
            if (isTurso) {
                const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Users'");
                userTableExists = result.rows.length > 0;
            } else {
                const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='Users'").get();
                userTableExists = !!result;
            }
            console.log(`   Users table exists: ${userTableExists ? '✅ YES' : '❌ NO'}`);
        } catch (e) {
            console.log(`   Error checking schema: ${e.message}`);
        }

        if (!userTableExists) {
            console.log('   ⚠️ Migration likely not run on this DB.');
            return;
        }

        // 2. Check Data
        console.log('\n2. Data Check:');
        let users = [];
        if (isTurso) {
            const result = await db.execute('SELECT id, email, name, createdAt FROM Users');
            users = result.rows;
        } else {
            users = db.prepare('SELECT id, email, name, createdAt FROM Users').all();
        }

        console.log(`   Found ${users.length} users.`);
        users.forEach(u => {
            console.log(`   - [${u.id}] ${u.name} (${u.email})`);
        });

    } catch (err) {
        console.error('❌ Error:', err);
    }
})();
