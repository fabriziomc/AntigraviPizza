// Create Categories table and populate with 10 standard categories
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🏗️  Creating Categories table...\n');

// Create Categories table
db.prepare(`
  CREATE TABLE IF NOT EXISTS Categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    displayOrder INTEGER,
    description TEXT,
    createdAt INTEGER NOT NULL
  )
`).run();

console.log('✓ Categories table created\n');

// Define 10 standard categories
const categories = [
    {
        name: 'Impasti',
        icon: '🌾',
        displayOrder: 1,
        description: 'Farine, lieviti, acqua, sale, olio per impasti'
    },
    {
        name: 'Basi e Salse',
        icon: '🍅',
        displayOrder: 2,
        description: 'Salse base, creme, condimenti liquidi'
    },
    {
        name: 'Formaggi',
        icon: '🧀',
        displayOrder: 3,
        description: 'Tutti i formaggi (freschi, stagionati, fusi)'
    },
    {
        name: 'Latticini',
        icon: '🥛',
        displayOrder: 4,
        description: 'Prodotti lattiero-caseari non formaggi'
    },
    {
        name: 'Carni e Salumi',
        icon: '🥓',
        displayOrder: 5,
        description: 'Carni fresche, salumi, affettati'
    },
    {
        name: 'Pesce e Frutti di Mare',
        icon: '🐟',
        displayOrder: 6,
        description: 'Pesce fresco, affumicato, conservato'
    },
    {
        name: 'Verdure e Ortaggi',
        icon: '🥬',
        displayOrder: 7,
        description: 'Verdure fresche, grigliate, sott\'olio'
    },
    {
        name: 'Erbe e Spezie',
        icon: '🌿',
        displayOrder: 8,
        description: 'Aromi, spezie, erbe fresche e secche'
    },
    {
        name: 'Frutta e Frutta Secca',
        icon: '🥜',
        displayOrder: 9,
        description: 'Frutta fresca, secca, semi'
    },
    {
        name: 'Altro',
        icon: '📦',
        displayOrder: 10,
        description: 'Ingredienti speciali, miele, aceti, etc.'
    }
];

console.log('📝 Populating categories...\n');

const insertStmt = db.prepare(`
  INSERT INTO Categories (id, name, icon, displayOrder, description, createdAt)
  VALUES (?, ?, ?, ?, ?, ?)
`);

categories.forEach(cat => {
    const id = randomUUID();
    insertStmt.run(
        id,
        cat.name,
        cat.icon,
        cat.displayOrder,
        cat.description,
        Date.now()
    );
    console.log(`✓ ${cat.icon} ${cat.name}`);
});

// Create index
db.prepare('CREATE INDEX IF NOT EXISTS idx_categories_order ON Categories(displayOrder)').run();

console.log('\n✅ Categories created successfully!\n');

// Verify
const allCategories = db.prepare('SELECT * FROM Categories ORDER BY displayOrder').all();
console.log('=== VERIFICATION ===');
console.log(`Total categories: ${allCategories.length}\n`);

allCategories.forEach(cat => {
    console.log(`${cat.displayOrder}. ${cat.icon} ${cat.name}`);
    console.log(`   ${cat.description}`);
});

db.close();
