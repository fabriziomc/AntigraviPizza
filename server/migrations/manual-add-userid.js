import { getDb } from '../db.js';

/**
 * Manually add userId columns to all tables
 */

async function addUserIdColumns() {
    console.log('🔄 Manually adding userId columns...');

    const db = getDb();
    const isTurso = typeof db?.execute === 'function';

    const tables = [
        'Recipes',
        'PizzaNights',
        'Guests',
        'Combinations',
        'Preparations',
        'Ingredients',
        'Categories'
    ];

    // Get admin user ID
    let adminId;
    if (isTurso) {
        const result = await db.execute({
            sql: 'SELECT id FROM Users WHERE email = ?',
            args: ['admin@antigravipizza.local']
        });
        adminId = result.rows[0]?.id;
    } else {
        const result = db.prepare('SELECT id FROM Users WHERE email = ?').get('admin@antigravipizza.local');
        adminId = result?.id;
    }

    if (!adminId) {
        console.error('❌ Admin user not found!');
        process.exit(1);
    }

    console.log(`✅ Found admin user: ${adminId}`);

    for (const table of tables) {
        try {
            console.log(`\n📝 Processing ${table}...`);

            // Check if column exists
            let hasColumn = false;
            if (isTurso) {
                const result = await db.execute(`PRAGMA table_info(${table})`);
                hasColumn = result.rows.some(row => row.name === 'userId');
                console.log(`   Columns: ${result.rows.map(r => r.name).join(', ')}`);
            } else {
                const result = db.prepare(`PRAGMA table_info(${table})`).all();
                hasColumn = result.some(row => row.name === 'userId');
            }

            if (hasColumn) {
                console.log(`   ⏭️  ${table} already has userId column`);
                continue;
            }

            // Add userId column
            console.log(`   Adding userId column...`);
            const alterSql = `ALTER TABLE ${table} ADD COLUMN userId TEXT`;

            if (isTurso) {
                await db.execute(alterSql);
            } else {
                db.exec(alterSql);
            }

            console.log(`   ✅ Column added`);

            // Update existing records
            console.log(`   Updating existing records...`);
            const updateSql = `UPDATE ${table} SET userId = ? WHERE userId IS NULL`;

            if (isTurso) {
                const result = await db.execute({
                    sql: updateSql,
                    args: [adminId]
                });
                console.log(`   ✅ Updated ${result.rowsAffected || 0} rows`);
            } else {
                const stmt = db.prepare(updateSql);
                const result = stmt.run(adminId);
                console.log(`   ✅ Updated ${result.changes} rows`);
            }

            // Create index
            console.log(`   Creating index...`);
            const indexSql = `CREATE INDEX IF NOT EXISTS idx_${table.toLowerCase()}_userId ON ${table}(userId)`;

            if (isTurso) {
                await db.execute(indexSql);
            } else {
                db.exec(indexSql);
            }

            console.log(`   ✅ Index created`);

        } catch (error) {
            console.error(`   ❌ Error processing ${table}:`, error.message);
            throw error;
        }
    }

    console.log('\n🎉 All tables updated successfully!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    addUserIdColumns()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

export { addUserIdColumns };
