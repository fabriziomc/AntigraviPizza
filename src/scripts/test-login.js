
import { getDb } from '../../server/db.js';
import DatabaseAdapter from '../../server/db-adapter.js';
import bcrypt from 'bcrypt';

(async () => {
    try {
        const email = 'admin@antigravipizza.local';
        const password = 'admin123';

        console.log('--- 🔐 LOGIN DEBUG ---');
        console.log(`Target Email: ${email}`);
        console.log(`Target Password: ${password}`);

        const adapter = new DatabaseAdapter();

        // 1. Fetch User
        console.log('\n1. Fetching User...');
        const user = await adapter.getUserByEmail(email);

        if (!user) {
            console.log('❌ User NOT FOUND in database.');
            process.exit(1);
        }

        console.log('✅ User found:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Stored Hash: ${user.password.substring(0, 15)}...`);

        // 2. Test Password Match
        console.log('\n2. Testing Password Match...');
        const match = await bcrypt.compare(password, user.password);
        console.log(`   bcrypt.compare('${password}', hash) => ${match}`);

        if (match) {
            console.log('✅ PASSWORD MATCHES! The issue is likely elsewhere (e.g., token generation, response format, or client-side handling).');
            // Test token generation just in case
            console.log('\n3. Testing Token Generation...');
            try {
                // Mock middleware import if needed or just use simple JWT sign if middleware unavailable here
                // We'll trust the route logic for now if password matches.
                console.log('   (Skipped token generation test, focus was on password)');
            } catch (e) {
                console.log('   Error testing token:', e);
            }
        } else {
            console.log('❌ PASSWORD MISMATCH! The stored hash does NOT match "admin123".');
            console.log('   Action: You may need to reset the password manually.');
        }

    } catch (err) {
        console.error('❌ Error:', err);
    }
})();
