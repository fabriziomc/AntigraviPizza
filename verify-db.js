import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

console.log('Querying Settings table...');
try {
    const rows = db.prepare('SELECT * FROM Settings').all();
    console.log('Settings Rows:');
    console.log(JSON.stringify(rows, null, 2));
} catch (err) {
    console.error('Error querying database:', err);
} finally {
    db.close();
}
