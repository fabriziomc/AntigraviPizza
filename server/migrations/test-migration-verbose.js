import { getDb } from '../db.js';
import bcrypt from 'bcrypt';

async function runMigrationVerbose() {
    console.log('🔄 Starting multi-user migration (VERBOSE MODE)...');

    const db = getDb();
    const isTurso = typeof db?.execute === 'function';
    console.log('Database type:', isTurso ? 'Turso' : 'SQLite');

    try {
        // 1. Create Users table
        console.log('\n📝 Step 1: Creating Users table...');
        const createUsersTable = `CREATE TABLE IF NOT EXISTS Users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            businessName TEXT,
            createdAt INTEGER NOT NULL,
            lastLogin INTEGER
        )`;

        console.log('SQL:', createUsersTable);

        if (isTurso) {
            const result = await db.execute(createUsersTable);
            console.log('Turso execute result:', result);
        } else {
            db.exec(createUsersTable);
        }
        console.log('✅ Users table created');

        // Verify table was created
        if (isTurso) {
            const checkTable = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Users'");
            console.log('Table check result:', checkTable.rows);
        }

        // 2. Create Settings table
        console.log('\n📝 Step 2: Creating Settings table...');
        const createSettingsTable = `CREATE TABLE IF NOT EXISTS Settings (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            bringEmail TEXT,
            bringPassword TEXT,
            geminiModel TEXT,
            defaultDough TEXT,
            preferences TEXT
        )`;

        console.log('SQL:', createSettingsTable);

        if (isTurso) {
            const result = await db.execute(createSettingsTable);
            console.log('Turso execute result:', result);
        } else {
            db.exec(createSettingsTable);
        }
        console.log('✅ Settings table created');

        // 3. Create admin user
        console.log('\n📝 Step 3: Creating admin user...');
        const adminId = 'admin-' + Date.now();
        const adminEmail = 'admin@antigravipizza.local';
        const adminPassword = await bcrypt.hash('admin123', 10);

        console.log('Admin ID:', adminId);
        console.log('Admin Email:', adminEmail);
        console.log('Password hash length:', adminPassword.length);

        const insertAdmin = `INSERT INTO Users (id, email, password, name, businessName, createdAt) VALUES (?, ?, ?, ?, ?, ?)`;

        if (isTurso) {
            const result = await db.execute({
                sql: insertAdmin,
                args: [adminId, adminEmail, adminPassword, 'Admin', 'AntigraviPizza', Date.now()]
            });
            console.log('Insert result:', result);
        } else {
            const stmt = db.prepare(insertAdmin);
            stmt.run(adminId, adminEmail, adminPassword, 'Admin', 'AntigraviPizza', Date.now());
        }

        console.log('✅ Admin user created');

        // Verify user was created
        if (isTurso) {
            const checkUser = await db.execute({
                sql: 'SELECT id, email, name FROM Users',
                args: []
            });
            console.log('Users in database:', checkUser.rows);
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Migration failed with error:');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        throw error;
    }
}

runMigrationVerbose()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
