import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const tursoDb = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function checkAllSettings() {
    const output = [];

    try {
        // Get ALL settings with full details
        const settings = await tursoDb.execute('SELECT * FROM Settings ORDER BY userId');
        output.push(`TOTAL SETTINGS RECORDS: ${settings.rows.length}\n`);

        settings.rows.forEach((s, index) => {
            output.push(`[${index + 1}] Settings Record:`);
            output.push(`    ID: ${s.id}`);
            output.push(`    userId: ${s.userId}`);
            output.push(`    maxOvenTemp: ${s.maxOvenTemp}`);
            output.push(`    geminiApiKey: ${s.geminiApiKey ? s.geminiApiKey.substring(0, 20) + '...' : 'NULL'}`);
            output.push(`    bringEmail: ${s.bringEmail || 'NULL'}`);
            output.push(`    bringPassword: ${s.bringPassword ? '***SET***' : 'NULL'}`);
            output.push('');
        });

        // Get users
        const users = await tursoDb.execute('SELECT id, email FROM Users ORDER BY email');
        output.push(`\nUSERS (${users.rows.length}):`);
        users.rows.forEach(u => {
            const setting = settings.rows.find(s => s.userId === u.id);
            if (setting) {
                output.push(`  ${u.email} → maxOvenTemp: ${setting.maxOvenTemp}`);
            } else {
                output.push(`  ${u.email} → NO SETTINGS`);
            }
        });

        // Write to file
        const result = output.join('\n');
        fs.writeFileSync('all-settings-check.txt', result);
        console.log(result);
        console.log('\nReport saved to all-settings-check.txt');

    } catch (err) {
        console.error('ERROR:', err.message);
        console.error(err.stack);
    }
}

checkAllSettings();
