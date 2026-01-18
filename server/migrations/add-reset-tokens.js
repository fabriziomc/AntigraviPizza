import { getDb } from '../db.js';

async function runMigration() {
    console.log('🔄 Starting password reset tokens migration...');

    const db = getDb();
    const isTurso = typeof db?.execute === 'function';

    try {
        console.log('📝 Checking Users table for reset token columns...');

        let hasResetToken = false;
        let hasResetExpires = false;

        if (isTurso) {
            const result = await db.execute('PRAGMA table_info(Users)');
            hasResetToken = result.rows.some(row => row.name === 'resetToken');
            hasResetExpires = result.rows.some(row => row.name === 'resetExpires');
        } else {
            const result = db.prepare('PRAGMA table_info(Users)').all();
            hasResetToken = result.some(row => row.name === 'resetToken');
            hasResetExpires = result.some(row => row.name === 'resetExpires');
        }

        if (!hasResetToken) {
            console.log('📝 Adding resetToken column to Users...');
            const alterSql = 'ALTER TABLE Users ADD COLUMN resetToken TEXT';
            if (isTurso) await db.execute(alterSql);
            else db.exec(alterSql);
            console.log('✅ resetToken column added');
        } else {
            console.log('⏭️  resetToken column already exists');
        }

        if (!hasResetExpires) {
            console.log('📝 Adding resetExpires column to Users...');
            const alterSql = 'ALTER TABLE Users ADD COLUMN resetExpires INTEGER';
            if (isTurso) await db.execute(alterSql);
            else db.exec(alterSql);
            console.log('✅ resetExpires column added');
        } else {
            console.log('⏭️  resetExpires column already exists');
        }

        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runMigration()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

export { runMigration };
