import { getDb } from '../db.js';

/**
 * Debug script to manually add userId column to Recipes table
 */

async function addUserIdToRecipes() {
    console.log('🔄 Starting debug migration for Recipes table...\n');

    const db = getDb();
    console.log('✅ Database connection obtained');
    console.log('   Type:', typeof db?.execute === 'function' ? 'Turso' : 'SQLite');

    try {
        // 1. Check current schema
        console.log('\n📋 Current Recipes table schema:');
        const schemaResult = await db.execute('PRAGMA table_info(Recipes)');
        console.log(JSON.stringify(schemaResult.rows, null, 2));

        const hasUserId = schemaResult.rows.some(row => row.name === 'userId');
        console.log(`\n   Has userId column: ${hasUserId}`);

        if (hasUserId) {
            console.log('\n✅ userId column already exists!');
            return;
        }

        // 2. Get admin user ID
        console.log('\n👤 Finding admin user...');
        const adminResult = await db.execute({
            sql: 'SELECT id, email FROM Users WHERE email = ?',
            args: ['admin@antigravipizza.local']
        });

        if (adminResult.rows.length === 0) {
            throw new Error('Admin user not found!');
        }

        const adminId = adminResult.rows[0].id;
        console.log(`   ✅ Found admin: ${adminResult.rows[0].email} (${adminId})`);

        // 3. Add userId column
        console.log('\n📝 Adding userId column to Recipes...');
        const alterResult = await db.execute('ALTER TABLE Recipes ADD COLUMN userId TEXT');
        console.log('   ALTER TABLE result:', JSON.stringify(alterResult, null, 2));

        // 4. Verify column was added
        console.log('\n🔍 Verifying column was added...');
        const verifyResult = await db.execute('PRAGMA table_info(Recipes)');
        const nowHasUserId = verifyResult.rows.some(row => row.name === 'userId');
        console.log(`   Has userId column now: ${nowHasUserId}`);

        if (!nowHasUserId) {
            throw new Error('userId column was not added!');
        }

        // 5. Update existing records
        console.log('\n📝 Updating existing records...');
        const updateResult = await db.execute({
            sql: 'UPDATE Recipes SET userId = ? WHERE userId IS NULL',
            args: [adminId]
        });
        console.log(`   ✅ Updated ${updateResult.rowsAffected || 0} rows`);

        // 6. Create index
        console.log('\n📝 Creating index...');
        await db.execute('CREATE INDEX IF NOT EXISTS idx_recipes_userId ON Recipes(userId)');
        console.log('   ✅ Index created');

        // 7. Final verification
        console.log('\n🔍 Final schema check:');
        const finalResult = await db.execute('PRAGMA table_info(Recipes)');
        const userIdColumn = finalResult.rows.find(row => row.name === 'userId');
        if (userIdColumn) {
            console.log('   ✅ userId column exists:', JSON.stringify(userIdColumn, null, 2));
        } else {
            console.log('   ❌ userId column NOT found!');
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('   Stack:', error.stack);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    addUserIdToRecipes()
        .then(() => {
            console.log('\n✅ Script completed');
            process.exit(0);
        })
        .catch(err => {
            console.error('\n❌ Script failed:', err);
            process.exit(1);
        });
}

export { addUserIdToRecipes };
