// Create missing ingredients found in preparations
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🔧 Creating missing ingredients...\n');

// Get categories
const categories = db.prepare('SELECT * FROM Categories').all();
const categoryMap = {};
categories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
});

// Missing ingredients with their suggested categories
const missingIngredients = {
    // Verdure
    'Aceto balsamico di Modena': 'Altro',
    'Aceto di mele': 'Altro',
    'Aglio in polvere': 'Erbe e Spezie',
    'Aglio nero': 'Erbe e Spezie',
    'Alloro': 'Erbe e Spezie',
    'Ananas': 'Frutta e Frutta Secca',
    'Arancia': 'Frutta e Frutta Secca',
    'Avocado': 'Frutta e Frutta Secca',
    'Barbabietola': 'Verdure e Ortaggi',
    'Basilico': 'Erbe e Spezie',
    'Carota': 'Verdure e Ortaggi',
    'Ceci': 'Verdure e Ortaggi',
    'Cipolla': 'Verdure e Ortaggi',
    'Cipolle Tropea': 'Verdure e Ortaggi',
    'Cipolle rosse': 'Verdure e Ortaggi',
    'Cocco': 'Frutta e Frutta Secca',
    'Finocchi': 'Verdure e Ortaggi',
    'Kiwi': 'Frutta e Frutta Secca',
    'Lime': 'Frutta e Frutta Secca',
    'Limone': 'Frutta e Frutta Secca',
    'Mandorle': 'Frutta e Frutta Secca',
    'Mango': 'Frutta e Frutta Secca',
    'Melanzane': 'Verdure e Ortaggi',
    'Melone': 'Frutta e Frutta Secca',
    'Noce moscata': 'Erbe e Spezie',
    'Patate viola': 'Verdure e Ortaggi',
    'Pepe nero': 'Erbe e Spezie',
    'Peperoncino': 'Erbe e Spezie',
    'Peperoni rossi': 'Verdure e Ortaggi',
    'Pistacchi di Bronte': 'Frutta e Frutta Secca',
    'Pomodori secchi sott\'olio': 'Verdure e Ortaggi',
    'Pomodorini': 'Verdure e Ortaggi',
    'Pomodoro': 'Verdure e Ortaggi',
    'Zucca': 'Verdure e Ortaggi',

    // Carni
    'Anatra': 'Carni e Salumi',
    'Baccalà': 'Pesce e Frutti di Mare',
    'Carne': 'Carni e Salumi',
    'Carne macinata': 'Carni e Salumi',
    'Carpaccio di manzo': 'Carni e Salumi',
    'Fassona': 'Carni e Salumi',
    'Filetti di tonno': 'Pesce e Frutti di Mare',
    'Gamberi': 'Pesce e Frutti di Mare',
    'Guanciale': 'Carni e Salumi',
    'Stoccafisso ammollato': 'Pesce e Frutti di Mare',

    // Formaggi
    'Gorgonzola DOP dolce': 'Formaggi',
    'Parmigiano': 'Formaggi',
    'Pecorino': 'Formaggi',

    // Impasti
    'Farina': 'Impasti',
    'Farina 00': 'Impasti',
    'Farina Grano saraceno': 'Impasti',
    'Farina di castagne': 'Impasti',

    // Salse e condimenti
    'Brodo di carne': 'Basi e Salse',
    'Olio': 'Basi e Salse',
    'Olio EVO': 'Basi e Salse',
    'Pasta di tartufo nero': 'Basi e Salse',
    'Polpa di pomodoro': 'Basi e Salse',
    'Salsa di Soia': 'Basi e Salse',
    'Salsa di soia': 'Basi e Salse',
    'Tabasco': 'Basi e Salse',
    'Wasabi': 'Basi e Salse',
    'Worchester': 'Basi e Salse',

    // Spezie
    'Sale': 'Erbe e Spezie',

    // Altro
    'Agar Agar': 'Altro',
    'Miele': 'Altro',
    'Vino rosso': 'Altro',
    'Zucchero': 'Altro',
    'Zucchero di canna': 'Altro'
};

const insertStmt = db.prepare(`
  INSERT INTO Ingredients (id, name, categoryId, defaultUnit, isCustom, dateAdded)
  VALUES (?, ?, ?, ?, ?, ?)
`);

let created = 0;
Object.entries(missingIngredients).forEach(([name, catName]) => {
    const categoryId = categoryMap[catName];
    if (!categoryId) {
        console.error(`❌ Category not found: ${catName}`);
        return;
    }

    try {
        insertStmt.run(
            randomUUID(),
            name,
            categoryId,
            'g',
            0,
            Date.now()
        );
        console.log(`✓ Created: ${name} (${catName})`);
        created++;
    } catch (error) {
        console.log(`  Already exists: ${name}`);
    }
});

console.log(`\n✅ Created ${created} new ingredients`);

db.close();
