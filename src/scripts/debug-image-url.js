
import { getDb } from '../../server/db.js';
import DatabaseAdapter from '../../server/db-adapter.js';

(async () => {
    try {
        const db = getDb();
        const adapter = new DatabaseAdapter();

        console.log('--- 🔍 DATABASE DEBUG ---');

        // 1. Check Schema
        if (adapter.isSQLite) {
            const tableInfo = db.prepare("PRAGMA table_info(PizzaNights)").all();
            const imageUrlCol = tableInfo.find(c => c.name === 'imageUrl');
            console.log('1. Schema Check:');
            console.log('   imageUrl column exists:', !!imageUrlCol);
            if (imageUrlCol) console.log('   Column details:', imageUrlCol);
        } else {
            console.log('1. Schema Check: SQL check skipped (Turso db)');
        }

        // 2. Check Data
        console.log('\n2. Data Check:');
        const nights = await adapter.getAllPizzaNights();
        console.log(`   Found ${nights.length} pizza nights.`);

        nights.forEach(n => {
            const hasImage = !!n.imageUrl;
            const imgLen = hasImage ? n.imageUrl.length : 0;
            const imgPreview = hasImage ? n.imageUrl.substring(0, 50) + '...' : 'NULL';
            console.log(`   - [${n.id}] ${n.name}`);
            console.log(`     Data: ${new Date(n.date).toLocaleDateString()} | Image: ${hasImage ? '✅ YES' : '❌ NO'} (Len: ${imgLen})`);
            console.log(`     Preview: ${imgPreview}`);
        });

    } catch (err) {
        console.error('❌ Error:', err);
    }
})();
