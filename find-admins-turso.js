import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
    url,
    authToken
});

async function findAdmins() {
    try {
        const result = await client.execute("SELECT email, role FROM Users WHERE role = 'admin'");
        console.log('Admins found:', result.rows);
    } catch (err) {
        console.error('Error querying Turso:', err.message);
    } finally {
        // client.close() is not always available depending on version, 
        // but we can just let the script exit
    }
}

findAdmins();
