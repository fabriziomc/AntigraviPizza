import Database from 'better-sqlite3';

const db = new Database('./antigravipizza.db');

console.log('🔄 Migrating preparations ingredients from strings to objects...\n');

const preps = db.prepare('SELECT * FROM Preparations').all();
let migrated = 0;

const updateStmt = db.prepare('UPDATE Preparations SET ingredients = ? WHERE id = ?');

preps.forEach(prep => {
    const ingredients = JSON.parse(prep.ingredients || '[]');

    if (ingredients.length > 0) {
        // Check if any ingredient is a string (old format)
        const hasStrings = ingredients.some(ing => typeof ing === 'string');

        if (hasStrings) {
            console.log(`🔧 Migrating: ${prep.name} (${prep.category})`);

            // Convert strings to objects
            const migratedIngredients = ingredients.map(ing => {
                if (typeof ing === 'string') {
                    // Convert string to object with default values
                    return {
                        name: ing,
                        quantity: 100, // Default quantity
                        unit: 'g',     // Default unit
                        perPortion: (100 / prep.yield).toFixed(2),
                        category: 'Altro'
                    };
                } else {
                    // Already an object, keep it but ensure all fields exist
                    return {
                        name: ing.name || 'Ingrediente',
                        quantity: ing.quantity || 100,
                        unit: ing.unit || 'g',
                        perPortion: ing.perPortion || (ing.quantity / prep.yield).toFixed(2),
                        category: ing.category || 'Altro'
                    };
                }
            });

            // Update database
            updateStmt.run(JSON.stringify(migratedIngredients), prep.id);
            migrated++;

            console.log(`   ✅ Migrated ${migratedIngredients.length} ingredients`);
        }
    }
});

console.log(`\n✅ Migration complete: ${migrated} preparations updated`);

db.close();
