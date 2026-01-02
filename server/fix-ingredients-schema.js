// Fix Ingredients table by recreating without CHECK constraint
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🔧 Fixing Ingredients table schema...\n');

try {
    // Start transaction
    db.prepare('BEGIN TRANSACTION').run();

    // Create new table without CHECK constraint
    db.prepare(`
    CREATE TABLE IF NOT EXISTS Ingredients_new (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      subcategory TEXT,
      minWeight INTEGER,
      maxWeight INTEGER,
      defaultUnit TEXT DEFAULT 'g',
      postBake INTEGER DEFAULT 0,
      phase TEXT DEFAULT 'topping',
      season TEXT,
      allergens TEXT,
      tags TEXT,
      isCustom INTEGER DEFAULT 0,
      dateAdded INTEGER NOT NULL
    )
  `).run();

    // Copy data
    db.prepare(`
    INSERT INTO Ingredients_new 
    SELECT * FROM Ingredients
  `).run();

    // Drop old table
    db.prepare('DROP TABLE Ingredients').run();

    // Rename new table
    db.prepare('ALTER TABLE Ingredients_new RENAME TO Ingredients').run();

    // Recreate indexes
    db.prepare('CREATE INDEX IF NOT EXISTS idx_ingredients_category ON Ingredients(category)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_ingredients_custom ON Ingredients(isCustom)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_ingredients_name ON Ingredients(name)').run();

    // Now update the categories
    const latticiniIngredients = [
        'Burro',
        'Latte',
        'Latte intero',
        'Panna',
        'Panna fresca',
        'Yogurt',
        'Uova',
        'Crema di burrata'
    ];

    const updateStmt = db.prepare('UPDATE Ingredients SET category = ? WHERE name = ?');
    let fixed = 0;

    latticiniIngredients.forEach(name => {
        const result = updateStmt.run('Latticini', name);
        if (result.changes > 0) {
            console.log(`✓ ${name} → Latticini`);
            fixed++;
        }
    });

    // Commit transaction
    db.prepare('COMMIT').run();

    console.log(`\n✅ Updated ${fixed} ingredients`);

    // Verify
    console.log('\n🔍 Verification:');
    const verify = db.prepare('SELECT name, category FROM Ingredients WHERE category = ?').all('Latticini');

    verify.forEach(row => {
        console.log(`  ${row.name}: ${row.category}`);
    });

} catch (error) {
    db.prepare('ROLLBACK').run();
    console.error('❌ Error:', error);
    throw error;
} finally {
    db.close();
}
