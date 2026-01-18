import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
    url,
    authToken
});

async function verifyDataIntegrity() {
    try {
        console.log('🔍 Verifying database integrity...\n');

        // 1. Get all users
        const usersResult = await client.execute("SELECT id, email, name FROM Users ORDER BY email");
        const users = usersResult.rows;
        const userIds = users.map(u => u.id);

        console.log(`👥 Active Users (${users.length}):`);
        users.forEach(u => console.log(`   - ${u.email} (${u.name}) [ID: ${u.id}]`));
        console.log('');

        // 2. Check each table for orphaned data
        const tables = [
            'Settings',
            'Recipes',
            'PizzaNights',
            'Guests',
            'Combinations',
            'Preparations',
            'Ingredients',
            'Categories',
            'ArchetypeWeights'
        ];

        let orphanedDataFound = false;

        for (const table of tables) {
            const result = await client.execute(`SELECT DISTINCT userId FROM ${table} WHERE userId IS NOT NULL`);
            const tableUserIds = result.rows.map(r => r.userId);

            // Find orphaned userIds (present in table but not in Users)
            const orphanedIds = tableUserIds.filter(id => !userIds.includes(id));

            if (orphanedIds.length > 0) {
                orphanedDataFound = true;
                console.log(`❌ ${table}: Found ${orphanedIds.length} orphaned userId(s):`);
                orphanedIds.forEach(id => console.log(`   - ${id}`));

                // Count orphaned records
                for (const orphanedId of orphanedIds) {
                    const countResult = await client.execute({
                        sql: `SELECT COUNT(*) as count FROM ${table} WHERE userId = ?`,
                        args: [orphanedId]
                    });
                    console.log(`     → ${countResult.rows[0].count} orphaned records`);
                }
            } else {
                console.log(`✅ ${table}: No orphaned data (${tableUserIds.length} unique userId(s))`);
            }
        }

        console.log('\n' + '='.repeat(60));
        if (orphanedDataFound) {
            console.log('⚠️  ORPHANED DATA DETECTED - Cleanup may be needed');
        } else {
            console.log('✅ DATABASE INTEGRITY VERIFIED - No orphaned data found!');
        }
        console.log('='.repeat(60));

    } catch (err) {
        console.error('❌ Error verifying database:', err.message);
    }
}

verifyDataIntegrity();
