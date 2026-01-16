import { getDb } from './server/db.js';

const db = getDb();
console.log("Database type:", typeof db.prepare === 'function' ? 'SQLite' : 'Turso');

async function checkSchema() {
    try {
        if (typeof db.prepare === 'function') {
            const tableInfo = db.prepare("PRAGMA table_info(Users)").all();
            console.log("Users table schema:", tableInfo);
        } else {
            const result = await db.execute("PRAGMA table_info(Users)");
            console.log("Users table schema:", result.rows);
        }
    } catch (err) {
        console.error("Error checking schema:", err);
    }
}

checkSchema();
