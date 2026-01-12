import { getDb } from '../db.js';
import bcrypt from 'bcrypt';

/**
 * Migration script to add multi-user authentication support
 * - Creates Users and Settings tables
 * - Adds userId column to all existing tables
 * - Creates default admin user
 * - Migrates existing data to admin user
 */

async function runMigration() {
    console.log('🔄 Starting multi-user migration...');

    const db = getDb();
    const isTurso = typeof db?.execute === 'function';

    try {
        // 1. Create Users table
        console.log('📝 Creating Users table...');
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS Users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                businessName TEXT,
                createdAt INTEGER NOT NULL,
                lastLogin INTEGER
            )
        `;

        if (isTurso) {
            await db.execute(createUsersTable);
        } else {
            db.exec(createUsersTable);
        }
        console.log('✅ Users table created');

        // 2. Create Settings table
        console.log('📝 Creating Settings table...');
        const createSettingsTable = `
            CREATE TABLE IF NOT EXISTS Settings (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                bringEmail TEXT,
                bringPassword TEXT,
                geminiModel TEXT,
                defaultDough TEXT,
                preferences TEXT,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
            )
        `;

        if (isTurso) {
            await db.execute(createSettingsTable);
        } else {
            db.exec(createSettingsTable);
        }
        console.log('✅ Settings table created');

        // 3. Create default admin user
        console.log('👤 Creating default admin user...');
        const adminId = 'admin-' + Date.now();
        const adminEmail = 'admin@antigravipizza.local';
        const adminPassword = await bcrypt.hash('admin123', 10);

        // Check if admin user already exists
        let adminExists = false;
        if (isTurso) {
            const checkResult = await db.execute({
                sql: 'SELECT id FROM Users WHERE email = ?',
                args: [adminEmail]
            });
            adminExists = checkResult.rows.length > 0;
        } else {
            const checkResult = db.prepare('SELECT id FROM Users WHERE email = ?').get(adminEmail);
            adminExists = !!checkResult;
        }

        if (!adminExists) {
            const insertAdmin = `INSERT INTO Users (id, email, password, name, businessName, createdAt) VALUES (?, ?, ?, ?, ?, ?)`;

            if (isTurso) {
                await db.execute({
                    sql: insertAdmin,
                    args: [adminId, adminEmail, adminPassword, 'Admin', 'AntigraviPizza', Date.now()]
                });
            } else {
                const stmt = db.prepare(insertAdmin);
                stmt.run(adminId, adminEmail, adminPassword, 'Admin', 'AntigraviPizza', Date.now());
            }
            console.log('✅ Admin user created');
            console.log('   Email: admin@antigravipizza.local');
            console.log('   Password: admin123');
        } else {
            console.log('⏭️  Admin user already exists');
        }

        // 4. Add userId column to existing tables
        const tables = [
            'Recipes',
            'PizzaNights',
            'Guests',
            'Combinations',
            'Preparations',
            'Ingredients',
            'Categories'
        ];

        for (const table of tables) {
            console.log(`📝 Adding userId to ${table}...`);

            // Check if column already exists
            let hasColumn = false;
            if (isTurso) {
                const result = await db.execute(`PRAGMA table_info(${table})`);
                hasColumn = result.rows.some(row => row.name === 'userId');
            } else {
                const result = db.prepare(`PRAGMA table_info(${table})`).all();
                hasColumn = result.some(row => row.name === 'userId');
            }

            if (!hasColumn) {
                const alterTable = `ALTER TABLE ${table} ADD COLUMN userId TEXT`;

                if (isTurso) {
                    await db.execute(alterTable);
                } else {
                    db.exec(alterTable);
                }

                // Update existing records to use admin user
                const updateRecords = `UPDATE ${table} SET userId = ? WHERE userId IS NULL`;

                if (isTurso) {
                    await db.execute({
                        sql: updateRecords,
                        args: [adminId]
                    });
                } else {
                    const stmt = db.prepare(updateRecords);
                    stmt.run(adminId);
                }

                console.log(`✅ ${table} updated`);
            } else {
                console.log(`⏭️  ${table} already has userId column`);
            }
        }

        // 5. Create indexes for performance
        console.log('📝 Creating indexes...');
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email)',
            'CREATE INDEX IF NOT EXISTS idx_settings_userId ON Settings(userId)',
            'CREATE INDEX IF NOT EXISTS idx_recipes_userId ON Recipes(userId)',
            'CREATE INDEX IF NOT EXISTS idx_pizzanights_userId ON PizzaNights(userId)',
            'CREATE INDEX IF NOT EXISTS idx_guests_userId ON Guests(userId)',
            'CREATE INDEX IF NOT EXISTS idx_combinations_userId ON Combinations(userId)',
            'CREATE INDEX IF NOT EXISTS idx_preparations_userId ON Preparations(userId)',
            'CREATE INDEX IF NOT EXISTS idx_ingredients_userId ON Ingredients(userId)',
            'CREATE INDEX IF NOT EXISTS idx_categories_userId ON Categories(userId)'
        ];

        for (const indexSql of indexes) {
            if (isTurso) {
                await db.execute(indexSql);
            } else {
                db.exec(indexSql);
            }
        }
        console.log('✅ Indexes created');

        console.log('');
        console.log('🎉 Migration completed successfully!');
        console.log('');
        console.log('📋 Summary:');
        console.log('   - Users and Settings tables created');
        console.log('   - All existing tables updated with userId column');
        console.log('   - All existing data assigned to admin user');
        console.log('   - Indexes created for performance');
        console.log('');
        console.log('🔐 Default Admin Credentials:');
        console.log('   Email: admin@antigravipizza.local');
        console.log('   Password: admin123');
        console.log('');
        console.log('⚠️  IMPORTANT: Change the admin password after first login!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigration()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

export { runMigration };
