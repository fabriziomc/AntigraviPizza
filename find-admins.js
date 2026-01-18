import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPaths = [
    path.join(__dirname, 'antigravipizza.db'),
    path.join(__dirname, 'server', 'antigravipizza.db')
];

for (const dbPath of dbPaths) {
    try {
        console.log(`\nChecking database: ${dbPath}`);
        const db = new Database(dbPath);
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        console.log('Tables found:', tables.map(t => t.name));

        if (tables.some(t => t.name.toLowerCase() === 'users')) {
            const tableName = tables.find(t => t.name.toLowerCase() === 'users').name;
            const admins = db.prepare(`SELECT email FROM ${tableName} WHERE role = 'admin'`).all();
            console.log('Admins found:', admins);
        }
        db.close();
    } catch (err) {
        console.error(`Error checking ${dbPath}:`, err.message);
    }
}
