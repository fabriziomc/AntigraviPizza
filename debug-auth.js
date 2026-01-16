import DatabaseAdapter from './server/db-adapter.js';
import { getDb } from './server/db.js';

const dbAdapter = new DatabaseAdapter();

(async () => {
    try {
        console.log('STARTING DEBUG AUTH...');

        // 1. Check if we can fetch ANY user
        console.log('1. Fetching all users (limit 1)...');
        let user;
        const db = getDb();

        if (dbAdapter.isSQLite) {
            user = db.prepare('SELECT * FROM Users LIMIT 1').get();
        } else {
            const result = await db.execute('SELECT * FROM Users LIMIT 1');
            user = result.rows[0];
        }

        if (!user) {
            console.log('⚠️ No users found in DB.');
            return;
        }

        console.log('✅ Found user:', user.email);
        console.log('   User keys:', Object.keys(user));
        console.log('   User role:', user.role);

        // 2. Test getUserByEmail
        console.log('\n2. Testing getUserByEmail...');
        const fetchedUser = await dbAdapter.getUserByEmail(user.email);
        console.log('✅ Fetched user via adapter:', fetchedUser ? 'Success' : 'Failed');
        if (fetchedUser) {
            console.log('   Fetched role:', fetchedUser.role);
        }

    } catch (err) {
        console.error('❌ CRITICAL ERROR:', err);
    }
})();
