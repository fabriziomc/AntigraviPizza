import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🔧 Starting Turso database migration: Adding phone column to Guests table...\n');

async function migrate() {
    try {
        // Check if phone column already exists
        const tableInfo = await db.execute("PRAGMA table_info(Guests)");
        const hasPhoneColumn = tableInfo.rows.some(col => col.name === 'phone');

        if (hasPhoneColumn) {
            console.log('✅ Phone column already exists in Guests table. No migration needed.');
        } else {
            // Add phone column
            await db.execute('ALTER TABLE Guests ADD COLUMN phone TEXT');
            console.log('✅ Successfully added phone column to Guests table');
        }

        // Verify the change
        const updatedInfo = await db.execute("PRAGMA table_info(Guests)");
        console.log('\n📋 Current Guests table schema:');
        updatedInfo.rows.forEach(col => {
            const notNull = col.notnull ? ' NOT NULL' : '';
            const defaultVal = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : '';
            console.log(`   - ${col.name}: ${col.type}${notNull}${defaultVal}`);
        });

        console.log('\n✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    } finally {
        await db.close();
    }
}

migrate();
