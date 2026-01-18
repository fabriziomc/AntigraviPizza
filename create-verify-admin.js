import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
    url,
    authToken
});

async function createVerificationAdmin() {
    const email = 'verify_admin@antigravi.local';
    const password = 'verify_password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = 'verify-' + crypto.randomUUID();

    try {
        console.log(`🚀 Creating verification admin: ${email}`);
        await client.execute({
            sql: "INSERT INTO Users (id, email, password, name, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
            args: [id, email, hashedPassword, 'Verify Admin', 'admin', Date.now()]
        });
        console.log('✅ Verification admin created successfully!');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            console.log('ℹ️ Verification admin already exists.');
        } else {
            console.error('❌ Error creating verification admin:', err.message);
        }
    }
}

createVerificationAdmin();
