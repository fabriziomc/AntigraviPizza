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

async function checkSettings() {
    const output = [];

    try {
        // Get users
        const users = await tursoDb.execute('SELECT id, email FROM Users');
        output.push(`USERS: ${users.rows.length}`);
        users.rows.forEach(u => output.push(`  ${u.email}`));

        // Get settings
        const settings = await tursoDb.execute('SELECT userId, maxOvenTemp, geminiApiKey, bringEmail FROM Settings');
        output.push(`\nSETTINGS: ${settings.rows.length}`);

        if (settings.rows.length === 0) {
            output.push('  NO SETTINGS RECORDS!');
        } else {
            settings.rows.forEach(s => {
                const user = users.rows.find(u => u.userId === s.userId);
                output.push(`  User: ${user ? user.email : s.userId}`);
                output.push(`    Temp: ${s.maxOvenTemp}, Gemini: ${s.geminiApiKey ? 'SET' : 'NULL'}, Bring: ${s.bringEmail || 'NULL'}`);
            });
        }

        // Write to file
        const result = output.join('\n');
        fs.writeFileSync('settings-report.txt', result);
        console.log(result);
        console.log('\nReport saved to settings-report.txt');

    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

checkSettings();
