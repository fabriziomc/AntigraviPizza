import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const tursoDb = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function checkAdminSettings() {
    try {
        // Get admin user
        const adminUser = await tursoDb.execute({
            sql: "SELECT id, email FROM Users WHERE email = ?",
            args: ['admin@antigravipizza.local']
        });

        if (adminUser.rows.length === 0) {
            console.log('❌ Admin user not found!');
            return;
        }

        const admin = adminUser.rows[0];
        console.log(`✓ Admin user found: ${admin.email}`);
        console.log(`  ID: ${admin.id}`);

        // Check for admin settings
        const adminSettings = await tursoDb.execute({
            sql: "SELECT * FROM Settings WHERE userId = ?",
            args: [admin.id]
        });

        console.log(`\nSettings records for admin: ${adminSettings.rows.length}`);

        if (adminSettings.rows.length === 0) {
            console.log('❌ NO SETTINGS RECORD FOR ADMIN!');
            console.log('\nThis means the fix has not been triggered yet.');
            console.log('The fix will create the Settings record on the FIRST save attempt.');
        } else {
            console.log('✓ Admin settings found:');
            adminSettings.rows.forEach(s => {
                console.log(`  ID: ${s.id}`);
                console.log(`  maxOvenTemp: ${s.maxOvenTemp}`);
                console.log(`  geminiApiKey: ${s.geminiApiKey || 'NULL'}`);
                console.log(`  bringEmail: ${s.bringEmail || 'NULL'}`);
            });
        }

    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

checkAdminSettings();
