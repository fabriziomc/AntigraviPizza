// Check Settings table in Turso database
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

async function checkSettings() {
    console.log('=== Checking Settings Table in Turso ===\n');

    try {
        // Check Users table
        console.log('👥 Checking Users table...');
        const usersResult = await tursoDb.execute('SELECT id, email, name, role FROM Users');
        console.log(`Found ${usersResult.rows.length} users:\n`);
        usersResult.rows.forEach(user => {
            console.log(`  - ${user.email}`);
            console.log(`    ID: ${user.id}`);
            console.log(`    Role: ${user.role || 'user'}\n`);
        });

        // Check Settings table
        console.log('\n⚙️  Checking Settings table...');
        const settingsResult = await tursoDb.execute('SELECT * FROM Settings');
        console.log(`Found ${settingsResult.rows.length} settings records\n`);

        if (settingsResult.rows.length === 0) {
            console.log('  ⚠️  NO SETTINGS RECORDS FOUND!\n');
        } else {
            settingsResult.rows.forEach(setting => {
                console.log(`  Settings for userId: ${setting.userId}`);
                console.log(`    - ID: ${setting.id}`);
                console.log(`    - maxOvenTemp: ${setting.maxOvenTemp}`);
                console.log(`    - geminiApiKey: ${setting.geminiApiKey ? '***SET***' : 'null'}`);
                console.log(`    - bringEmail: ${setting.bringEmail || 'null'}`);
                console.log(`    - bringPassword: ${setting.bringPassword ? '***SET***' : 'null'}\n`);
            });
        }

        // Cross-check
        console.log('\n🔍 Cross-checking users with settings...');
        for (const user of usersResult.rows) {
            const userSettings = settingsResult.rows.find(s => s.userId === user.id);
            if (!userSettings) {
                console.log(`  ❌ User ${user.email} (${user.id}) has NO settings record!`);
            } else {
                console.log(`  ✅ User ${user.email} has settings`);
            }
        }

        console.log('\n✓ Check complete');
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

checkSettings();
