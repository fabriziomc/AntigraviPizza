// Script to update ingredient categories in the database
const Database = require('better-sqlite3');
const db = new Database('./server/antigravipizza.db');

// Get category IDs
const carniSalumiId = db.prepare("SELECT id FROM Categories WHERE name = 'Carni e Salumi'").get()?.id;
const verdureId = db.prepare("SELECT id FROM Categories WHERE name = 'Verdure e Ortaggi'").get()?.id;

console.log('Category IDs:');
console.log('  Carni e Salumi:', carniSalumiId);
console.log('  Verdure e Ortaggi:', verdureId);

if (!carniSalumiId || !verdureId) {
    console.error('\n❌ Could not find required categories!');
    process.exit(1);
}

// Update Foie gras
const foieUpdate = db.prepare("UPDATE Ingredients SET categoryId = ? WHERE name = 'Foie gras'");
const foieResult = foieUpdate.run(carniSalumiId);
console.log(`\n✅ Updated Foie gras: ${foieResult.changes} row(s)`);

// Update Tartufo bianco
const tartufoUpdate1 = db.prepare("UPDATE Ingredients SET categoryId = ? WHERE name = 'Tartufo bianco'");
const tartufoResult1 = tartufoUpdate1.run(verdureId);
console.log(`✅ Updated Tartufo bianco: ${tartufoResult1.changes} row(s)`);

// Update Tartufo nero
const tartufoUpdate2 = db.prepare("UPDATE Ingredients SET categoryId = ? WHERE name = 'Tartufo nero'");
const tartufoResult2 = tartufoUpdate2.run(verdureId);
console.log(`✅ Updated Tartufo nero: ${tartufoResult2.changes} row(s)`);

// Update cipolla o cipollotto
const cipollaUpdate = db.prepare("UPDATE Ingredients SET categoryId = ? WHERE name = 'cipolla o cipollotto'");
const cipollaResult = cipollaUpdate.run(verdureId);
console.log(`✅ Updated cipolla o cipollotto: ${cipollaResult.changes} row(s)`);

// Verify changes
console.log('\n=== VERIFICATION ===');
const verify = db.prepare(`
    SELECT i.name, c.name as category 
    FROM Ingredients i 
    LEFT JOIN Categories c ON i.categoryId = c.id 
    WHERE i.name IN ('Foie gras', 'Tartufo bianco', 'Tartufo nero', 'cipolla o cipollotto')
    ORDER BY i.name
`).all();

verify.forEach(row => {
    console.log(`  ${row.name} → ${row.category}`);
});

db.close();
console.log('\n✅ Database updated successfully!');
