
import { getDb } from '../../server/db.js';
import DatabaseAdapter from '../../server/db-adapter.js';
import bcrypt from 'bcrypt';

(async () => {
    try {
        const email = 'admin@antigravipizza.local';
        const newPassword = 'admin123';

        console.log('--- 🔄 PASSWORD RESET ---');
        console.log(`Target: ${email}`);

        const adapter = new DatabaseAdapter();
        const user = await adapter.getUserByEmail(email);

        if (!user) {
            console.error('❌ User not found!');
            process.exit(1);
        }

        console.log('1. Hashing new password...');
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log('2. Updating database...');
        await adapter.updateUser(user.id, { password: hashedPassword });

        console.log('✅ Password reset successfully!');
        console.log(`   New Password: ${newPassword}`);

    } catch (err) {
        console.error('❌ Error:', err);
    }
})();
