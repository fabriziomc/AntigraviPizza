// Migrate Ingredients table to use categoryId
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🔄 Migrating Ingredients table...\n');

try {
    db.prepare('BEGIN TRANSACTION').run();

    // Get categories
    const categories = db.prepare('SELECT * FROM Categories').all();
    const categoryMap = {};
    categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
    });

    // Mapping logic (same as map-categories.js)
    const oldToNewCategoryMap = {
        'Formaggi': 'Formaggi',
        'Latticini': 'Latticini',
        'Pesce': 'Pesce e Frutti di Mare',
        'Erbe e Spezie': 'Erbe e Spezie',
        'Verdure': 'Verdure e Ortaggi',
        'Carne': 'Carni e Salumi',
        'Salsa': 'Basi e Salse',
        'Impasto': 'Impasti',
        'Altro': 'Altro'
    };

    const specialMappings = {
        'Noci': 'Frutta e Frutta Secca', 'Pistacchi': 'Frutta e Frutta Secca',
        'Pistacchi di Bronte': 'Frutta e Frutta Secca', 'Pinoli': 'Frutta e Frutta Secca',
        'Mandorle': 'Frutta e Frutta Secca', 'Granella di mandorle': 'Frutta e Frutta Secca',
        'Semi di sesamo': 'Frutta e Frutta Secca', 'Semi di Sesamo': 'Frutta e Frutta Secca',
        'Fichi': 'Frutta e Frutta Secca', 'Pere': 'Frutta e Frutta Secca',
        'Mele': 'Frutta e Frutta Secca', 'Ananas': 'Frutta e Frutta Secca',
        'Arancia': 'Frutta e Frutta Secca', 'Limone': 'Frutta e Frutta Secca',
        'Lime': 'Frutta e Frutta Secca', 'Kiwi': 'Frutta e Frutta Secca',
        'Mango': 'Frutta e Frutta Secca', 'Avocado': 'Frutta e Frutta Secca',
        'Melone': 'Frutta e Frutta Secca', 'Cocco': 'Frutta e Frutta Secca',
        'Miele': 'Altro', 'Miele di acacia': 'Altro', 'Miele di castagno': 'Altro',
        'Zucchero': 'Altro', 'Zucchero di canna': 'Altro',
        'Aceto balsamico': 'Altro', 'Aceto': 'Altro', 'Aceto di mele': 'Altro',
        'Olive': 'Altro', 'Olive taggiasche': 'Altro', 'Olive nere': 'Altro',
        'Capperi': 'Altro',
        'Farina': 'Impasti', 'Farina 00': 'Impasti', 'Farina tipo 0': 'Impasti',
        'Farina tipo 1': 'Impasti', 'Farina integrale': 'Impasti',
        'Farina Grano saraceno': 'Impasti', 'Farina di castagne': 'Impasti',
        'Acqua': 'Impasti',
        'Sale': 'Erbe e Spezie', 'Sale fino': 'Erbe e Spezie', 'Sale marino': 'Erbe e Spezie',
        'Lievito': 'Impasti', 'Lievito di birra': 'Impasti', 'Lievito madre': 'Impasti',
        'Olio': 'Basi e Salse', 'Olio EVO': 'Basi e Salse',
        'Olio extravergine': 'Basi e Salse', 'Olio di oliva': 'Basi e Salse'
    };

    // Create new table with categoryId
    console.log('Creating new Ingredients table structure...');
    db.prepare(`
    CREATE TABLE Ingredients_new (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      categoryId TEXT NOT NULL,
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
      dateAdded INTEGER NOT NULL,
      FOREIGN KEY (categoryId) REFERENCES Categories(id)
    )
  `).run();

    // Migrate data
    console.log('Migrating ingredient data...\n');
    const oldIngredients = db.prepare('SELECT * FROM Ingredients').all();
    const insertStmt = db.prepare(`
    INSERT INTO Ingredients_new 
    (id, name, categoryId, subcategory, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    let migrated = 0;
    const categoryStats = {};

    oldIngredients.forEach(ing => {
        // Determine new category
        let newCategoryName;
        if (specialMappings[ing.name]) {
            newCategoryName = specialMappings[ing.name];
        } else {
            newCategoryName = oldToNewCategoryMap[ing.category] || 'Altro';
        }

        const categoryId = categoryMap[newCategoryName];
        if (!categoryId) {
            console.error(`❌ No category ID for: ${newCategoryName}`);
            return;
        }

        insertStmt.run(
            ing.id,
            ing.name,
            categoryId,
            ing.subcategory,
            ing.minWeight,
            ing.maxWeight,
            ing.defaultUnit,
            ing.postBake,
            ing.phase,
            ing.season,
            ing.allergens,
            ing.tags,
            ing.isCustom,
            ing.dateAdded
        );

        categoryStats[newCategoryName] = (categoryStats[newCategoryName] || 0) + 1;
        migrated++;
    });

    // Drop old table and rename new one
    console.log('\nReplacing old table...');
    db.prepare('DROP TABLE Ingredients').run();
    db.prepare('ALTER TABLE Ingredients_new RENAME TO Ingredients').run();

    // Recreate indexes
    db.prepare('CREATE INDEX IF NOT EXISTS idx_ingredients_categoryId ON Ingredients(categoryId)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_ingredients_custom ON Ingredients(isCustom)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_ingredients_name ON Ingredients(name)').run();

    db.prepare('COMMIT').run();

    console.log(`\n✅ Migrated ${migrated} ingredients\n`);
    console.log('=== DISTRIBUTION BY CATEGORY ===');
    Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
        const icon = categories.find(c => c.name === cat)?.icon || '📦';
        console.log(`${icon} ${cat}: ${count}`);
    });

} catch (error) {
    db.prepare('ROLLBACK').run();
    console.error('❌ Migration failed:', error);
    throw error;
} finally {
    db.close();
}
