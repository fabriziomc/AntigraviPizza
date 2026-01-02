import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

// Get category ID map
const categories = db.prepare('SELECT * FROM Categories').all();
const categoryIdMap = {};
categories.forEach(cat => {
    categoryIdMap[cat.name] = cat.id;
});

// Lista delle preparazioni con ingredienti completi
const preparationsData = `Nome Preparazione,Ingredienti
Ananas caramellato,Ananas (100g); Burro (100g); Zucchero (100g)
Anatra,Anatra (1000g); Burro (100g); Timo (10g); Sale (10g); Pepe nero (5g)
Baccalà in vasocottura,Baccalà dissalato (800g); Olio EVO (80ml); Aglio (10g); Prezzemolo (20g); Pepe nero (3g); Limone (20ml)
Baccalà mantecato,Baccalà dissalato (800g); Olio EVO (120ml); Aglio (8g); Prezzemolo (20g); Latte (100ml); Pepe bianco (3g)
Chips di grano saraceno,Farina di grano saraceno (200g); Acqua (300ml); Olio di semi (500ml); Sale (5g)
Composta pere e zenzero,Pere (100g); Zucchero (100g); Zenzero (100g); Limone (20ml)
Coralli viola,Acqua (300ml); Farina 00 (100g); Olio EVO (30ml); Cavolo cappuccio viola (50g)
Manzo marinato,Manzo (600g); Aceto balsamico (100g); Zenzero (20g); Olio EVO (50ml); Sale (6g); Pepe nero (3g)
Stracotto di manzo,Manzo (1200g); Aglio (10g); Sedano (80g); Carota (80g); Cipolla (100g); Vino rosso (300ml); Brodo (500ml); Olio EVO (60ml); Alloro (2g)
Tartare di Fassona,Manzo Fassona (500g); Olio EVO (40ml); Sale Maldon (5g); Pepe nero (3g); Senape (20g); Tuorlo (2pz)
Tartare di Gamberi,Gamberi rossi (400g); Olio EVO (40ml); Sale (5g); Lime (20ml); Menta (10g)
Tonno Tataki,Tonno (500g); Semi di sesamo (100g); Zenzero (20g); Salsa di soia (40ml); Olio di semi (30ml)
Uova strapazzate,Uova (500g); Burro (80g); Sale (5g); Pepe nero (3g); Panna (50ml)
Uovo marinato,Uova (500g); Salsa di soia (200ml); Mirin (100ml); Zucchero (30g); Acqua (100ml)
Verza e Patate,Patate (100g); Verza (100g); Burro (100g); Aglio (100g); Pepe nero (5g)
Finocchi grigliati,Finocchi (600g); Olio EVO (60ml); Sale (5g); Pepe nero (3g); Timo (5g)
Melanzane Grigliate,Melanzane (600g); Olio EVO (80ml); Aglio (12g); Basilico fresco (20g); Sale (5g)
Peperoni Arrosto,Peperoni rossi (600g); Olio EVO (60ml); Aglio (8g); Prezzemolo (15g); Sale (4g)
Pomodori Confit,Pomodorini ciliegino (500g); Olio EVO (100ml); Timo (8g); Aglio (12g); Zucchero (20g); Sale (4g)
Pomodorini confit,Pomodori ciliegino (500g); Olio EVO (100ml); Timo (8g); Aglio (12g); Zucchero (20g); Sale (4g)
Crema di Burrata,Burrata (400g); Panna fresca (60ml); Olio EVO (30ml); Sale (3g)
Crema di Carciofi,Carciofi (400g); Aglio (8g); Olio EVO (60ml); Limone (20ml); Sale (4g)
Crema di Gorgonzola,Gorgonzola DOP dolce (300g); Panna fresca (150ml); Latte intero (50ml); Pepe nero (2g)
Crema di Melone,Melone (600g); Panna fresca (100ml); Sale (3g); Pepe bianco (2g); Olio EVO (20ml)
Crema di Patate,Patate (500g); Latte intero (100ml); Burro (50g); Sale (5g)
Crema di Pistacchio,Pistacchi di Bronte (200g); Panna fresca (150ml); Olio EVO (40ml); Sale (3g)
Crema di Ricotta,Ricotta fresca (400g); Panna fresca (80ml); Sale (4g); Pepe nero (2g)
Crema di Zucca,Zucca (600g); Panna fresca (80ml); Noce moscata (2g); Sale (4g)
Crema di barbabietola,Barbabietole cotte (400g); Yogurt (100g); Olio EVO (30ml); Sale (4g); Aceto di mele (15ml)
Crema di castagne,Castagne cotte (500g); Latte (100g); Burro (40g); Sale (3g)
Crema di ceci,Ceci lessati (500g); Olio EVO (60ml); Rosmarino (5g); Aglio (8g); Sale (4g)
Crema di friarielli,Friarielli (600g); Olio EVO (60ml); Aglio (10g); Peperoncino (3g); Sale (4g)
Crema di patate,Patate (600g); Sedano (80g); Cipolla (100g); Olio EVO (60ml); Brodo vegetale (500ml); Sale (5g)
Crema di patate viola,Patate viola (600g); Sedano (80g); Cipolla (100g); Olio EVO (60ml); Brodo vegetale (500ml);`;

// Mappa categorie standard
const categoryMap = {
    'Ananas': 'Altro',
    'Anatra': 'Carni e Salumi',
    'Baccalà dissalato': 'Pesce',
    'Olio EVO': 'Basi e Salse',
    'Aglio': 'Erbe e Spezie',
    'Prezzemolo': 'Erbe e Spezie',
    'Pepe nero': 'Erbe e Spezie',
    'Pepe bianco': 'Erbe e Spezie',
    'Limone': 'Altro',
    'Latte': 'Latticini',
    'Farina di grano saraceno': 'Impasti',
    'Acqua': 'Impasti',
    'Olio di semi': 'Basi e Salse',
    'Sale': 'Erbe e Spezie',
    'Pere': 'Altro',
    'Zucchero': 'Impasti',
    'Zenzero': 'Erbe e Spezie',
    'Farina 00': 'Impasti',
    'Cavolo cappuccio viola': 'Verdure e Ortaggi',
    'Manzo': 'Carni e Salumi',
    'Manzo Fassona': 'Carni e Salumi',
    'Aceto balsamico': 'Basi e Salse',
    'Sale Maldon': 'Erbe e Spezie',
    'Senape': 'Basi e Salse',
    'Tuorlo': 'Latticini',
    'Sedano': 'Verdure e Ortaggi',
    'Carota': 'Verdure e Ortaggi',
    'Cipolla': 'Verdure e Ortaggi',
    'Vino rosso': 'Altro',
    'Brodo': 'Basi e Salse',
    'Brodo vegetale': 'Basi e Salse',
    'Alloro': 'Erbe e Spezie',
    'Gamberi rossi': 'Pesce',
    'Lime': 'Altro',
    'Menta': 'Erbe e Spezie',
    'Tonno': 'Pesce',
    'Semi di sesamo': 'Altro',
    'Salsa di soia': 'Basi e Salse',
    'Uova': 'Latticini',
    'Burro': 'Latticini',
    'Panna': 'Latticini',
    'Mirin': 'Altro',
    'Patate': 'Verdure e Ortaggi',
    'Patate viola': 'Verdure e Ortaggi',
    'Verza': 'Verdure e Ortaggi',
    'Finocchi': 'Verdure e Ortaggi',
    'Timo': 'Erbe e Spezie',
    'Melanzane': 'Verdure e Ortaggi',
    'Basilico fresco': 'Erbe e Spezie',
    'Peperoni rossi': 'Verdure e Ortaggi',
    'Pomodorini ciliegino': 'Verdure e Ortaggi',
    'Pomodori ciliegino': 'Verdure e Ortaggi',
    'Burrata': 'Formaggi',
    'Panna fresca': 'Latticini',
    'Carciofi': 'Verdure e Ortaggi',
    'Gorgonzola DOP dolce': 'Formaggi',
    'Latte intero': 'Latticini',
    'Melone': 'Altro',
    'Pistacchi di Bronte': 'Altro',
    'Ricotta fresca': 'Formaggi',
    'Zucca': 'Verdure e Ortaggi',
    'Noce moscata': 'Erbe e Spezie',
    'Barbabietole cotte': 'Verdure e Ortaggi',
    'Yogurt': 'Latticini',
    'Aceto di mele': 'Basi e Salse',
    'Castagne cotte': 'Altro',
    'Ceci lessati': 'Verdure e Ortaggi',
    'Rosmarino': 'Erbe e Spezie',
    'Friarielli': 'Verdure e Ortaggi',
    'Peperoncino': 'Erbe e Spezie'
};

// Funzione per normalizzare i nomi degli ingredienti
function normalizeIngredientName(name) {
    // Rimuovi spazi extra
    name = name.trim();

    // Sostituzioni specifiche per uniformità
    const replacements = {
        'Olio extravergine di oliva': 'Olio EVO',
        'Pomodorini ciliegino': 'Pomodori ciliegino'
    };

    return replacements[name] || name;
}

// Funzione per verificare se un ingrediente esiste
function ingredientExists(name) {
    const normalizedName = normalizeIngredientName(name);
    const stmt = db.prepare('SELECT id FROM ingredients WHERE name = ?');
    return stmt.get(normalizedName) !== undefined;
}

// Funzione per aggiungere un ingrediente
function addIngredient(name, category) {
    const normalizedName = normalizeIngredientName(name);

    if (ingredientExists(normalizedName)) {
        console.log(`✓ Ingrediente già esistente: ${normalizedName}`);
        return;
    }

    const categoryId = categoryIdMap[category];
    if (!categoryId) {
        console.error(`✗ Categoria non trovata: ${category} per ingrediente ${normalizedName}`);
        return;
    }

    const defaultUnit = category === 'Basi e Salse' || category === 'Latticini' ? 'ml' : 'g';
    const minWeight = category === 'Erbe e Spezie' ? 5 : 50;
    const maxWeight = category === 'Erbe e Spezie' ? 20 : 200;

    const stmt = db.prepare(`
    INSERT INTO Ingredients (id, name, categoryId, subcategory, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    try {
        stmt.run(
            randomUUID(),
            normalizedName,
            categoryId,
            null, // subcategory
            minWeight,
            maxWeight,
            defaultUnit,
            0, // postBake
            'topping', // phase
            null, // season
            null, // allergens
            null, // tags
            0, // isCustom
            Date.now() // dateAdded
        );
        console.log(`✓ Aggiunto ingrediente: ${normalizedName} (${category})`);
    } catch (error) {
        console.error(`✗ Errore aggiungendo ${normalizedName}:`, error.message);
    }
}

// Funzione per estrarre ingredienti da una riga
function extractIngredients(ingredientsStr) {
    if (!ingredientsStr || ingredientsStr.trim() === '') return [];

    return ingredientsStr.split(';').map(ing => {
        const match = ing.trim().match(/^(.+?)\s*\((\d+(?:\.\d+)?)(g|ml|pz)\)$/);
        if (match) {
            return {
                name: match[1].trim(),
                quantity: parseFloat(match[2]),
                unit: match[3]
            };
        }
        return null;
    }).filter(Boolean);
}

console.log('=== Inizio aggiunta ingredienti mancanti ===\n');

// Parse della lista preparazioni
const lines = preparationsData.split('\n');
const allIngredients = new Set();

// Salta la prima riga (intestazione)
for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = line.split(',');
    if (parts.length < 2) continue;

    const prepName = parts[0];
    const ingredientsStr = parts.slice(1).join(','); // Nel caso ci siano virgole negli ingredienti

    const ingredients = extractIngredients(ingredientsStr);

    ingredients.forEach(ing => {
        allIngredients.add(ing.name);
    });
}

console.log(`Trovati ${allIngredients.size} ingredienti unici nella lista\n`);

// Aggiungi gli ingredienti mancanti
let added = 0;
let existing = 0;

allIngredients.forEach(name => {
    const normalizedName = normalizeIngredientName(name);
    const category = categoryMap[normalizedName] || 'Altro';

    if (!ingredientExists(normalizedName)) {
        addIngredient(normalizedName, category);
        added++;
    } else {
        existing++;
    }
});

console.log(`\n=== Riepilogo ===`);
console.log(`Ingredienti già esistenti: ${existing}`);
console.log(`Nuovi ingredienti aggiunti: ${added}`);
console.log(`\nTotale ingredienti processati: ${allIngredients.size}`);

db.close();
console.log('\n✓ Database chiuso');
