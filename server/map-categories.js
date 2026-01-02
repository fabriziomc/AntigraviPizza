// Map existing ingredients to new 10 categories
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

const db = new Database(dbPath);

console.log('🗺️  Mapping ingredients to new categories...\n');

// Get all categories
const categories = db.prepare('SELECT * FROM Categories ORDER BY displayOrder').all();
const categoryMap = {};
categories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
});

// Mapping from old categories to new categories
const oldToNewCategoryMap = {
    // Direct mappings
    'Formaggi': 'Formaggi',
    'Latticini': 'Latticini',
    'Pesce': 'Pesce e Frutti di Mare',
    'Erbe e Spezie': 'Erbe e Spezie',
    'Verdure': 'Verdure e Ortaggi',

    // Carni
    'Carne': 'Carni e Salumi',

    // Salse - need to check if it's an impasto ingredient or a sauce
    'Salsa': 'Basi e Salse',
    'Impasto': 'Impasti',

    // Everything else
    'Altro': 'Altro'
};

// Special mappings for specific ingredients
const specialMappings = {
    // Frutta secca
    'Noci': 'Frutta e Frutta Secca',
    'Pistacchi': 'Frutta e Frutta Secca',
    'Pistacchi di Bronte': 'Frutta e Frutta Secca',
    'Pinoli': 'Frutta e Frutta Secca',
    'Mandorle': 'Frutta e Frutta Secca',
    'Granella di mandorle': 'Frutta e Frutta Secca',
    'Semi di sesamo': 'Frutta e Frutta Secca',
    'Semi di Sesamo': 'Frutta e Frutta Secca',

    // Frutta fresca
    'Fichi': 'Frutta e Frutta Secca',
    'Pere': 'Frutta e Frutta Secca',
    'Mele': 'Frutta e Frutta Secca',
    'Ananas': 'Frutta e Frutta Secca',
    'Arancia': 'Frutta e Frutta Secca',
    'Limone': 'Frutta e Frutta Secca',
    'Lime': 'Frutta e Frutta Secca',
    'Kiwi': 'Frutta e Frutta Secca',
    'Mango': 'Frutta e Frutta Secca',
    'Avocado': 'Frutta e Frutta Secca',
    'Melone': 'Frutta e Frutta Secca',
    'Cocco': 'Frutta e Frutta Secca',

    // Dolcificanti e condimenti speciali
    'Miele': 'Altro',
    'Miele di acacia': 'Altro',
    'Miele di castagno': 'Altro',
    'Zucchero': 'Altro',
    'Zucchero di canna': 'Altro',
    'Aceto balsamico': 'Altro',
    'Aceto': 'Altro',
    'Aceto di mele': 'Altro',

    // Olive e capperi
    'Olive': 'Altro',
    'Olive taggiasche': 'Altro',
    'Olive nere': 'Altro',
    'Capperi': 'Altro',

    // Impasti specifici
    'Farina': 'Impasti',
    'Farina 00': 'Impasti',
    'Farina tipo 0': 'Impasti',
    'Farina tipo 1': 'Impasti',
    'Farina integrale': 'Impasti',
    'Farina Grano saraceno': 'Impasti',
    'Farina di castagne': 'Impasti',
    'Acqua': 'Impasti',
    'Sale': 'Erbe e Spezie',
    'Sale fino': 'Erbe e Spezie',
    'Sale marino': 'Erbe e Spezie',
    'Lievito': 'Impasti',
    'Lievito di birra': 'Impasti',
    'Lievito madre': 'Impasti',

    // Oli
    'Olio': 'Basi e Salse',
    'Olio EVO': 'Basi e Salse',
    'Olio extravergine': 'Basi e Salse',
    'Olio di oliva': 'Basi e Salse'
};

// Get all ingredients
const ingredients = db.prepare('SELECT * FROM Ingredients').all();

console.log('=== MAPPING PREVIEW ===\n');

const mappingResults = {};
let unmapped = [];

ingredients.forEach(ing => {
    let newCategory;

    // Check special mappings first
    if (specialMappings[ing.name]) {
        newCategory = specialMappings[ing.name];
    } else {
        // Use old category mapping
        newCategory = oldToNewCategoryMap[ing.category] || 'Altro';
    }

    if (!mappingResults[newCategory]) {
        mappingResults[newCategory] = [];
    }
    mappingResults[newCategory].push(ing.name);

    if (!categoryMap[newCategory]) {
        unmapped.push({ name: ing.name, oldCat: ing.category, newCat: newCategory });
    }
});

// Display mapping results
Object.keys(mappingResults).sort().forEach(cat => {
    const count = mappingResults[cat].length;
    const icon = categories.find(c => c.name === cat)?.icon || '❓';
    console.log(`${icon} ${cat}: ${count} ingredienti`);
});

if (unmapped.length > 0) {
    console.log('\n⚠️  UNMAPPED CATEGORIES:');
    unmapped.forEach(u => {
        console.log(`  ${u.name}: ${u.oldCat} → ${u.newCat} (NOT FOUND)`);
    });
} else {
    console.log('\n✅ All categories mapped successfully!');
}

// Save mapping for next step
import fs from 'fs';
const mappingFile = path.join(__dirname, '../backups', `category-mapping-${Date.now()}.json`);
fs.writeFileSync(mappingFile, JSON.stringify({
    oldToNewCategoryMap,
    specialMappings,
    categoryMap,
    mappingResults
}, null, 2));

console.log(`\n📄 Mapping saved to: ${mappingFile}`);

db.close();
