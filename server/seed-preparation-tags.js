import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { PREPARATION_TAG_MAPPING } from './data/preparation-tag-mapping.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../antigravipizza.db');

console.log('🏷️  Seeding Preparation Tags');
console.log('Database path:', dbPath);
console.log('');

const db = new Database(dbPath);

try {
    const updateStmt = db.prepare('UPDATE Preparations SET tags = ? WHERE name = ?');

    let updated = 0;
    let notFound = 0;
    let skipped = 0;

    // Get all preparations from database to check what exists
    const allPreparations = db.prepare('SELECT id, name, tags FROM Preparations').all();
    const preparationNames = new Set(allPreparations.map(p => p.name));

    console.log(`📊 Total preparations in mapping: ${Object.keys(PREPARATION_TAG_MAPPING).length}`);
    console.log(`📊 Total preparations in database: ${allPreparations.length}`);
    console.log('');

    for (const [name, tags] of Object.entries(PREPARATION_TAG_MAPPING)) {
        if (!preparationNames.has(name)) {
            console.log(`⚠️  Not found in DB: ${name}`);
            notFound++;
            continue;
        }

        const tagsJson = JSON.stringify(tags);
        const result = updateStmt.run(tagsJson, name);

        if (result.changes > 0) {
            console.log(`✓ ${name}:`);
            console.log(`  └─ [${tags.join(', ')}]`);
            updated++;
        } else {
            skipped++;
        }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Not found in DB: ${notFound}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log('='.repeat(60));

    // Check coverage
    const preparationsWithTags = db.prepare("SELECT COUNT(*) as count FROM Preparations WHERE tags IS NOT NULL AND tags != '[]'").get();
    const totalPreparations = db.prepare('SELECT COUNT(*) as count FROM Preparations').get();
    const coverage = (preparationsWithTags.count / totalPreparations.count * 100).toFixed(1);

    console.log('');
    console.log(`📈 Coverage: ${preparationsWithTags.count}/${totalPreparations.count} (${coverage}%)`);

    if (coverage < 100) {
        console.log('');
        console.log('⚠️  Preparations without tags:');
        const withoutTags = db.prepare('SELECT name FROM Preparations WHERE tags IS NULL OR tags = "[]" ORDER BY name').all();
        withoutTags.forEach(prep => {
            console.log(`   - ${prep.name}`);
        });
    }

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
} finally {
    db.close();
    console.log('');
    console.log('✅ Seed completed');
}
