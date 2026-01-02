// Add remaining missing ingredients found in preparations
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🔧 Adding remaining missing ingredients...\n');

// Get categories
const categories = db.prepare('SELECT * FROM Categories').all();
const categoryMap = {};
categories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
});

// Missing ingredients with their categories
const missingIngredients = {
    // Latticini
    'Burro': 'Latticini',
    'Burrata': 'Formaggi',
    'Panna': 'Latticini',
    'Panna fresca': 'Latticini',
    'Latte': 'Latticini',
    'Latte intero': 'Latticini',
    'Ricotta fresca': 'Formaggi',
    'Yogurt': 'Latticini',
    'Uova': 'Latticini',

    // Formaggi
    'Parmigiano Reggiano': 'Formaggi',
    'Pecorino Romano': 'Formaggi',

    // Verdure
    'Aglio': 'Verdure e Ortaggi',
    'Carciofi': 'Verdure e Ortaggi',
    'Carote': 'Verdure e Ortaggi',
    'Cavolo nero': 'Verdure e Ortaggi',
    'Friarielli': 'Verdure e Ortaggi',
    'Funghi champignon': 'Verdure e Ortaggi',
    'Patate': 'Verdure e Ortaggi',
    'Piselli': 'Verdure e Ortaggi',
    'Pomodorini ciliegino': 'Verdure e Ortaggi',
    'Pomodori secchi': 'Verdure e Ortaggi',
    'Porri': 'Verdure e Ortaggi',
    'Rucola': 'Verdure e Ortaggi',
    'Sedano': 'Verdure e Ortaggi',
    'Verza': 'Verdure e Ortaggi',
    'Zucchine': 'Verdure e Ortaggi',

    // Erbe e Spezie
    'Basilico fresco': 'Erbe e Spezie',
    'Menta': 'Erbe e Spezie',
    'Origano': 'Erbe e Spezie',
    'Paprika affumicata': 'Erbe e Spezie',
    'Prezzemolo': 'Erbe e Spezie',
    'Rosmarino': 'Erbe e Spezie',
    'Timo': 'Erbe e Spezie',
    'Zenzero': 'Erbe e Spezie',
    'Senape': 'Erbe e Spezie',

    // Frutta e Frutta Secca
    'Pere': 'Frutta e Frutta Secca',
    'Noci': 'Frutta e Frutta Secca',
    'Pinoli': 'Frutta e Frutta Secca',
    'Pistacchi': 'Frutta e Frutta Secca',
    'Semi di Sesamo': 'Frutta e Frutta Secca',

    // Basi e Salse
    'Passata di pomodoro': 'Basi e Salse',
    'Nduja calabrese': 'Carni e Salumi',

    // Altro
    'Aceto Balsamico': 'Altro',
    'Aceto balsamico': 'Altro',
    'Capperi': 'Altro',
    'Olive taggiasche': 'Altro'
};

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO Ingredients (id, name, categoryId, defaultUnit, isCustom, dateAdded)
  VALUES (?, ?, ?, ?, ?, ?)
`);

let created = 0;
Object.entries(missingIngredients).forEach(([name, catName]) => {
    const categoryId = categoryMap[catName];
    if (!categoryId) {
        console.error(`❌ Category not found: ${catName}`);
        return;
    }

    const result = insertStmt.run(
        randomUUID(),
        name,
        categoryId,
        'g',
        0,
        Date.now()
    );

    if (result.changes > 0) {
        console.log(`✓ Created: ${name} (${catName})`);
        created++;
    }
});

console.log(`\n✅ Created ${created} new ingredients`);

// Verify
const total = db.prepare('SELECT COUNT(*) as count FROM Ingredients').get();
console.log(`\n📊 Total ingredients in database: ${total.count}`);

db.close();
