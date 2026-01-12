import { getDb } from '../db.js';

/**
 * Execute migration on Turso database to add userId columns
 */

async function executeTursoMigration() {
    console.log('🔄 Starting Turso migration...\n');

    const db = getDb();

    // Get admin user ID
    console.log('👤 Finding admin user...');
    const adminResult = await db.execute({
        sql: 'SELECT id, email FROM Users WHERE email = ?',
        args: ['admin@antigravipizza.local']
    });

    if (adminResult.rows.length === 0) {
        throw new Error('Admin user not found!');
    }

    const adminId = adminResult.rows[0].id;
    console.log(`✅ Found admin: ${adminResult.rows[0].email} (${adminId})\n`);

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
        console.log(`\n📝 Processing ${table}...`);

        try {
            // Check if column exists
            const schemaResult = await db.execute(`PRAGMA table_info(${table})`);
            const hasUserId = schemaResult.rows.some(row => row.name === 'userId');

            if (hasUserId) {
                console.log(`   ⏭️  Already has userId column`);
                continue;
            }

            // Add userId column
            console.log(`   Adding userId column...`);
            await db.execute(`ALTER TABLE ${table} ADD COLUMN userId TEXT`);
            console.log(`   ✅ Column added`);

            // Verify it was added
            const verifyResult = await db.execute(`PRAGMA table_info(${table})`);
            const nowHasUserId = verifyResult.rows.some(row => row.name === 'userId');

            if (!nowHasUserId) {
                console.log(`   ⚠️  WARNING: Column may not have been added, but continuing...`);
            }

            // Update existing records
            console.log(`   Updating existing records...`);
            const updateResult = await db.execute({
                sql: `UPDATE ${table} SET userId = ? WHERE userId IS NULL`,
                args: [adminId]
            });
            console.log(`   ✅ Updated ${updateResult.rowsAffected || 0} rows`);

            // Create index
            console.log(`   Creating index...`);
            await db.execute(`CREATE INDEX IF NOT EXISTS idx_${table.toLowerCase()}_userId ON ${table}(userId)`);
            console.log(`   ✅ Index created`);

        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
            // Continue with other tables even if one fails
        }
    }

    console.log('\n\n🔍 Final verification...');
    for (const table of tables) {
        const result = await db.execute(`PRAGMA table_info(${table})`);
        const hasUserId = result.rows.some(row => row.name === 'userId');
        console.log(`   ${table}: ${hasUserId ? '✅' : '❌'} userId column`);
    }

    console.log('\n🎉 Migration completed!');
}

// Run
executeTursoMigration()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ Script failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    });
