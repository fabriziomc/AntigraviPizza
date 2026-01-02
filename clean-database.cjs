const Database = require('better-sqlite3');
const db = new Database('./antigravipizza.db');

console.log('🗑️  Cleaning database for fresh reseed...\n');

try {
    // Delete all recipes (custom data will be lost)
    const recipesDeleted = db.prepare('DELETE FROM Recipes').run();
    console.log(`✅ Deleted ${recipesDeleted.changes} recipes`);

    // Delete all pizza nights
    const nightsDeleted = db.prepare('DELETE FROM PizzaNights').run();
    console.log(`✅ Deleted ${nightsDeleted.changes} pizza nights`);

    // Delete all preparations
    const prepsDeleted = db.prepare('DELETE FROM Preparations').run();
    console.log(`✅ Deleted ${prepsDeleted.changes} preparations`);

    // Delete all ingredients
    const ingsDeleted = db.prepare('DELETE FROM Ingredients').run();
    console.log(`✅ Deleted ${ingsDeleted.changes} ingredients`);

    console.log('\n✅ Database cleaned successfully!');
    console.log('Now run seed scripts to repopulate.');

} catch (error) {
    console.error('❌ Error:', error.message);
} finally {
    db.close();
}
