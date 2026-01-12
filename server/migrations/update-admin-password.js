import { getDb } from '../db.js';
import bcrypt from 'bcrypt';

/**
 * Update admin password to a more secure one
 */
async function updateAdminPassword() {
    console.log('🔐 Updating admin password...');

    const db = getDb();
    const isTurso = typeof db?.execute === 'function';

    // New secure password
    const newPassword = 'AntiGravi2024!Pizza';

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update admin user password
        const updateSql = `UPDATE Users SET password = ? WHERE email = ?`;

        if (isTurso) {
            const result = await db.execute({
                sql: updateSql,
                args: [hashedPassword, 'admin@antigravipizza.local']
            });
            console.log('Update result:', result);
        } else {
            const stmt = db.prepare(updateSql);
            stmt.run(hashedPassword, 'admin@antigravipizza.local');
        }

        console.log('✅ Admin password updated successfully!');
        console.log('');
        console.log('🔐 New Admin Credentials:');
        console.log('   Email: admin@antigravipizza.local');
        console.log('   Password: AntiGravi2024!Pizza');
        console.log('');
        console.log('⚠️  Please save these credentials in a secure location!');

    } catch (error) {
        console.error('❌ Failed to update password:', error);
        throw error;
    }
}

updateAdminPassword()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
