
import { getDb } from './db.js';
import DatabaseAdapter from './db-adapter.js';

const targetEmail = process.argv[2];

if (!targetEmail) {
    console.error('❌ Usage: node server/promote-admin.js <email>');
    process.exit(1);
}

(async () => {
    try {
        const db = getDb();
        const adapter = new DatabaseAdapter();
        const isTurso = adapter.isTurso;

        console.log(`--- 👑 PROMOTE ADMIN: ${targetEmail} ---`);

        // Find user
        let user;
        if (isTurso) {
            const result = await db.execute({
                sql: "SELECT * FROM Users WHERE email = ?",
                args: [targetEmail]
            });
            user = result.rows[0];
        } else {
            user = db.prepare("SELECT * FROM Users WHERE email = ?").get(targetEmail);
        }

        if (!user) {
            console.error(`❌ User not found with email: ${targetEmail}`);
            process.exit(1);
        }

        console.log(`Found user: ${user.name} (Role: ${user.role || 'none'})`);

        // Update role
        if (isTurso) {
            await db.execute({
                sql: "UPDATE Users SET role = 'admin' WHERE email = ?",
                args: [targetEmail]
            });
        } else {
            db.prepare("UPDATE Users SET role = 'admin' WHERE email = ?").run(targetEmail);
        }

        console.log(`✅ User ${user.name} is now an ADMIN!`);

    } catch (err) {
        console.error('❌ Promotion failed:', err);
        process.exit(1);
    }
})();
