import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const TURSO_DB_URL = process.env.TURSO_DATABASE_URL;
const TURSO_DB_TOKEN = process.env.TURSO_AUTH_TOKEN;


if (!TURSO_DB_URL || !TURSO_DB_TOKEN) {
    console.error('❌ TURSO_DB_URL or TURSO_DB_TOKEN not set in environment');
    process.exit(1);
}

console.log('🔍 Connecting to Turso database...');
console.log('📍 URL:', TURSO_DB_URL);

const db = createClient({
    url: TURSO_DB_URL,
    authToken: TURSO_DB_TOKEN
});

async function verifySettings() {
    try {
        // Check Users table
        console.log('\n👥 Checking Users table...');
        const usersResult = await db.execute('SELECT id, email, name, role FROM Users');
        console.log(`Found ${usersResult.rows.length} users:`);
        usersResult.rows.forEach(user => {
            console.log(`  - ${user.email} (ID: ${user.id}, Role: ${user.role || 'user'})`);
        });

        // Check Settings table
        console.log('\n⚙️  Checking Settings table...');
        const settingsResult = await db.execute('SELECT * FROM Settings');
        console.log(`Found ${settingsResult.rows.length} settings records:`);

        if (settingsResult.rows.length === 0) {
            console.log('  ⚠️  NO SETTINGS RECORDS FOUND!');
        } else {
            settingsResult.rows.forEach(setting => {
                console.log(`\n  Settings for userId: ${setting.userId}`);
                console.log(`    - ID: ${setting.id}`);
                console.log(`    - maxOvenTemp: ${setting.maxOvenTemp}`);
                console.log(`    - geminiApiKey: ${setting.geminiApiKey ? '***SET***' : 'null'}`);
                console.log(`    - bringEmail: ${setting.bringEmail || 'null'}`);
                console.log(`    - bringPassword: ${setting.bringPassword ? '***SET***' : 'null'}`);
            });
        }

        // Check if Settings exist for each user
        console.log('\n🔍 Cross-checking users with settings...');
        for (const user of usersResult.rows) {
            const userSettings = settingsResult.rows.find(s => s.userId === user.id);
            if (!userSettings) {
                console.log(`  ❌ User ${user.email} (${user.id}) has NO settings record!`);
            } else {
                console.log(`  ✅ User ${user.email} (${user.id}) has settings`);
            }
        }

    } catch (err) {
        console.error('❌ Error querying database:', err);
        console.error('Error details:', err.message);
    }
}

verifySettings().then(() => {
    console.log('\n✅ Verification complete');
    process.exit(0);
}).catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
