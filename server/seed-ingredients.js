// ============================================
// SEED INGREDIENTS - Populate Ingredients Table
// ============================================

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database di ingredienti da migrare
const INGREDIENTS_DB = {
    // Basi e salse
    bases: [
        { name: 'Pomodoro San Marzano', category: 'Salsa', phase: 'topping', postBake: false },
        { name: 'Pomodorini datterini', category: 'Salsa', phase: 'topping', postBake: false },
        { name: 'Passata di pomodoro', category: 'Salsa', phase: 'topping', postBake: false },
        { name: 'Crema di zucca', category: 'Salsa', phase: 'topping', postBake: false },
        { name: 'Pesto di basilico', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Crema di pistacchio', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Crema di burrata', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Olio EVO aromatizzato', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Crema di ceci', category: 'Salsa', phase: 'topping', postBake: false },
        { name: 'Crema di melanzane', category: 'Salsa', phase: 'topping', postBake: false },
        { name: 'Salsa verde', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Crema di noci', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Crema di peperoni', category: 'Salsa', phase: 'topping', postBake: false },
        { name: 'Pesto di rucola', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Pesto rosso', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Salsa al pesto di olive', category: 'Salsa', phase: 'topping', postBake: true },
        // Nuove salse aggiunte
        { name: 'Ketchup', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Salsa BBQ', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Senape', category: 'Salsa', phase: 'topping', postBake: true },
        { name: 'Salsa al tartufo', category: 'Salsa', phase: 'topping', postBake: true }
    ],

    // Formaggi
    cheeses: [
        { name: 'Mozzarella di bufala', weight: [150, 200], phase: 'topping', postBake: false },
        { name: 'Fior di latte', weight: [120, 180], phase: 'topping', postBake: false },
        { name: 'Burrata', weight: [100, 150], phase: 'topping', postBake: true },
        { name: 'Stracciatella', weight: [80, 120], phase: 'topping', postBake: true },
        { name: 'Gorgonzola DOP', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Taleggio', weight: [70, 100], phase: 'topping', postBake: false },
        { name: 'Parmigiano Reggiano', weight: [40, 60], phase: 'topping', postBake: false },
        { name: 'Pecorino Romano', weight: [30, 50], phase: 'topping', postBake: false },
        { name: 'Provola affumicata', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Ricotta fresca', weight: [80, 120], phase: 'topping', postBake: true },
        { name: 'Scamorza', weight: [100, 140], phase: 'topping', postBake: false },
        { name: 'Caciocavallo', weight: [80, 120], phase: 'topping', postBake: false },
        { name: "Fontina Val d'Aosta", weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Asiago', weight: [70, 100], phase: 'topping', postBake: false },
        { name: 'Castelmagno', weight: [60, 90], phase: 'topping', postBake: false },
        { name: 'Squacquerone', weight: [80, 120], phase: 'topping', postBake: true },
        { name: 'Crescenza', weight: [80, 120], phase: 'topping', postBake: true },
        { name: 'Robiola', weight: [70, 100], phase: 'topping', postBake: true },
        { name: 'Brie', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Grana Padano', weight: [40, 60], phase: 'topping', postBake: false },
        { name: 'Caprino fresco', weight: [70, 100], phase: 'topping', postBake: true },
        { name: 'Stracchino', weight: [80, 120], phase: 'topping', postBake: true },
        // Nuovi formaggi aggiunti
        { name: 'Bitto', weight: [70, 100], phase: 'topping', postBake: false },
        { name: 'Casera', weight: [70, 100], phase: 'topping', postBake: false },
        { name: 'Cheddar', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Feta', weight: [60, 90], phase: 'topping', postBake: true }
    ],

    // Carni e salumi
    meats: [
        { name: 'Prosciutto crudo di Parma', weight: [60, 80], phase: 'topping', postBake: true },
        { name: 'Prosciutto cotto', weight: [70, 100], phase: 'topping', postBake: true },
        { name: 'Speck Alto Adige', weight: [50, 70], phase: 'topping', postBake: true },
        { name: 'Salsiccia fresca', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Guanciale croccante', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Pancetta', weight: [60, 90], phase: 'topping', postBake: false },
        { name: 'Bresaola', weight: [40, 60], phase: 'topping', postBake: true },
        { name: 'Salame piccante', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Mortadella', weight: [60, 90], phase: 'topping', postBake: true },
        { name: 'Nduja calabrese', weight: [30, 50], phase: 'topping', postBake: false },
        { name: 'Culatello di Zibello', weight: [50, 70], phase: 'topping', postBake: true },
        { name: 'Coppa di Parma', weight: [50, 70], phase: 'topping', postBake: true },
        { name: 'Lonza', weight: [50, 70], phase: 'topping', postBake: true },
        { name: 'Porchetta', weight: [70, 100], phase: 'topping', postBake: true },
        { name: 'Ventricina', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Finocchiona', weight: [50, 80], phase: 'topping', postBake: true },
        { name: 'Soppressata', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Lardo di Colonnata', weight: [30, 50], phase: 'topping', postBake: true },
        { name: 'Capocollo', weight: [50, 70], phase: 'topping', postBake: true },
        { name: 'Salamino piccante', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Prosciutto di San Daniele', weight: [60, 80], phase: 'topping', postBake: true },
        { name: 'Cotechino', weight: [80, 120], phase: 'topping', postBake: false },
        // Nuovi salumi aggiunti
        { name: 'Wurstel', weight: [60, 100], phase: 'topping', postBake: false }
    ],

    // Verdure
    vegetables: [
        { name: 'Funghi porcini', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Funghi champignon', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Melanzane grigliate', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Zucchine', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Peperoni', weight: [70, 100], phase: 'topping', postBake: false },
        { name: 'Carciofi', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Radicchio', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Rucola', weight: [30, 50], phase: 'topping', postBake: true },
        { name: 'Pomodorini ciliegino', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Olive taggiasche', weight: [40, 60], phase: 'topping', postBake: true },
        { name: 'Cipolla caramellata', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Friarielli', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Asparagi', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Spinaci', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Bietole', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Cavolo nero', weight: [70, 100], phase: 'topping', postBake: false },
        { name: 'Broccoli', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Cavolfiore', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Patate', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Patate dolci', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Pomodori secchi', weight: [40, 60], phase: 'topping', postBake: true },
        { name: 'Capperi', weight: [20, 40], phase: 'topping', postBake: true },
        { name: 'Sedano', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Carote', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Barbabietole', weight: [70, 100], phase: 'topping', postBake: false },
        { name: 'Piselli', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Fave', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Cicoria', weight: [60, 90], phase: 'topping', postBake: false },
        { name: 'Catalogna', weight: [60, 90], phase: 'topping', postBake: false },
        { name: 'Puntarelle', weight: [50, 80], phase: 'topping', postBake: true },
        { name: 'Agretti', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Cipolla rossa', weight: [50, 80], phase: 'topping', postBake: false },
        { name: 'Porri', weight: [60, 100], phase: 'topping', postBake: false },
        // Nuove verdure aggiunte
        { name: 'Pomodoro giallo', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Pomodorini Pachino', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Pomodorini gialli', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Carciofini', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Fiori di zucca', weight: [40, 70], phase: 'topping', postBake: false },
        { name: 'Scarola', weight: [70, 100], phase: 'topping', postBake: false },
        { name: 'Verza', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Aglio', weight: [10, 20], phase: 'topping', postBake: false },
        { name: 'Olive nere', weight: [40, 60], phase: 'topping', postBake: true },
        { name: 'Olive verdi', weight: [40, 60], phase: 'topping', postBake: true },
        { name: 'Pappacelle', weight: [50, 80], phase: 'topping', postBake: true },
        { name: 'Fiori di cappero', weight: [20, 40], phase: 'topping', postBake: true }
    ],

    // Premium (pesce e ingredienti pregiati)
    premium: [
        { name: 'Tartufo nero', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Tartufo bianco', weight: [5, 15], phase: 'topping', postBake: true },
        { name: 'Salmone affumicato', weight: [60, 80], phase: 'topping', postBake: true },
        { name: 'Alici di Cetara', weight: [40, 60], phase: 'topping', postBake: true },
        { name: 'Bottarga', weight: [20, 30], phase: 'topping', postBake: true },
        { name: 'Caviale', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Foie gras', weight: [30, 50], phase: 'topping', postBake: true },
        { name: 'Scampi', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Gamberi rossi', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Polpo', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Cozze', weight: [100, 150], phase: 'topping', postBake: false },
        { name: 'Vongole', weight: [80, 120], phase: 'topping', postBake: false },
        { name: 'Capesante', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Tonno fresco', weight: [70, 100], phase: 'topping', postBake: true },
        { name: 'Acciughe', weight: [30, 50], phase: 'topping', postBake: true },
        // Nuovo pesce aggiunto
        { name: 'Carpaccio di tonno', weight: [60, 90], phase: 'topping', postBake: true },
        { name: 'Gamberetti', weight: [70, 100], phase: 'topping', postBake: false },
        { name: 'Misto pesce paella', weight: [100, 150], phase: 'topping', postBake: false }
    ],

    // Finishes (erbe, spezie, condimenti)
    finishes: [
        { name: 'Basilico fresco', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Origano', weight: [5, 10], phase: 'topping', postBake: false },
        { name: 'Rosmarino', weight: [5, 10], phase: 'topping', postBake: false },
        { name: 'Peperoncino fresco', weight: [5, 15], phase: 'topping', postBake: true },
        { name: 'Limone grattugiato', weight: [5, 10], phase: 'topping', postBake: true },
        { name: 'Miele di acacia', weight: [15, 30], phase: 'topping', postBake: true },
        { name: 'Noci', weight: [30, 50], phase: 'topping', postBake: true },
        { name: 'Pistacchi', weight: [30, 50], phase: 'topping', postBake: true },
        { name: 'Pere', weight: [60, 100], phase: 'topping', postBake: false },
        { name: 'Fichi', weight: [50, 80], phase: 'topping', postBake: true },
        { name: 'Olio al tartufo', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Aceto balsamico', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Riduzione di balsamico', weight: [15, 25], phase: 'topping', postBake: true },
        { name: 'Timo', weight: [5, 10], phase: 'topping', postBake: false },
        { name: 'Salvia', weight: [5, 10], phase: 'topping', postBake: false },
        { name: 'Maggiorana', weight: [5, 10], phase: 'topping', postBake: false },
        { name: 'Prezzemolo', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Erba cipollina', weight: [5, 15], phase: 'topping', postBake: true },
        { name: 'Aneto', weight: [5, 10], phase: 'topping', postBake: true },
        { name: 'Menta', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Zenzero', weight: [5, 10], phase: 'topping', postBake: true },
        { name: 'Paprika affumicata', weight: [5, 10], phase: 'topping', postBake: false },
        { name: 'Semi di sesamo', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Granella di mandorle', weight: [20, 40], phase: 'topping', postBake: true },
        { name: 'Nocciole', weight: [30, 50], phase: 'topping', postBake: true },
        { name: 'Pinoli', weight: [20, 40], phase: 'topping', postBake: true },
        { name: 'Miele di castagno', weight: [15, 30], phase: 'topping', postBake: true },
        { name: 'Scaglie di cioccolato', weight: [20, 40], phase: 'topping', postBake: true },
        // Nuovi condimenti/dolci aggiunti
        { name: 'Zafferano', weight: [1, 3], phase: 'topping', postBake: false },
        { name: 'Rafano', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Liquirizia in polvere', weight: [5, 10], phase: 'topping', postBake: true },
        { name: 'Scorza di limone', weight: [5, 10], phase: 'topping', postBake: true },
        { name: 'Scorzette di arancia', weight: [5, 10], phase: 'topping', postBake: true },
        { name: 'Semi di sesamo tostati', weight: [10, 20], phase: 'topping', postBake: true },
        { name: 'Fragole', weight: [60, 100], phase: 'topping', postBake: true },
        { name: 'Confettura di fichi', weight: [30, 50], phase: 'topping', postBake: true },
        { name: 'Confettura di pere', weight: [30, 50], phase: 'topping', postBake: true },
        { name: 'Granella di pistacchi', weight: [20, 40], phase: 'topping', postBake: true }
    ]
};

function generateId(name) {
    return `ing-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function seedIngredients() {
    const dbPath = path.join(__dirname, '..', 'antigravipizza.db');
    const db = new Database(dbPath);

    console.log('🌱 Starting ingredients seed...');

    const ingredients = [];
    const now = Date.now();

    // Process each category
    Object.entries(INGREDIENTS_DB).forEach(([categoryKey, items]) => {
        items.forEach(item => {
            const category = categoryKey === 'bases' ? 'Salsa' :
                categoryKey === 'cheeses' ? 'Formaggi' :
                    categoryKey === 'meats' ? 'Carne' :
                        categoryKey === 'vegetables' ? 'Verdure' :
                            categoryKey === 'premium' ? 'Pesce' :
                                'Erbe e Spezie';

            ingredients.push({
                id: generateId(item.name),
                name: item.name,
                category,
                minWeight: item.weight ? item.weight[0] : null,
                maxWeight: item.weight ? item.weight[1] : null,
                defaultUnit: 'g',
                postBake: item.postBake ? 1 : 0,
                phase: item.phase || 'topping',
                season: null,
                allergens: null,
                tags: categoryKey === 'premium' ? JSON.stringify(['premium']) : null,
                isCustom: 0,
                dateAdded: now
            });
        });
    });

    // Insert in batch
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO Ingredients (id, name, category, minWeight, maxWeight, defaultUnit, postBake, phase, season, allergens, tags, isCustom, dateAdded)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let inserted = 0;
    ingredients.forEach(ing => {
        try {
            const result = stmt.run(
                ing.id,
                ing.name,
                ing.category,
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
            if (result.changes > 0) inserted++;
        } catch (err) {
            console.error(`Error inserting ${ing.name}:`, err.message);
        }
    });

    db.close();

    console.log(`✅ Seeded ${inserted} ingredients (${ingredients.length} total in source)`);
    console.log(`📊 Categories:`);
    console.log(`   - Salsa: ${ingredients.filter(i => i.category === 'Salsa').length}`);
    console.log(`   - Formaggi: ${ingredients.filter(i => i.category === 'Formaggi').length}`);
    console.log(`   - Carne: ${ingredients.filter(i => i.category === 'Carne').length}`);
    console.log(`   - Verdure: ${ingredients.filter(i => i.category === 'Verdure').length}`);
    console.log(`   - Pesce: ${ingredients.filter(i => i.category === 'Pesce').length}`);
    console.log(`   - Erbe e Spezie: ${ingredients.filter(i => i.category === 'Erbe e Spezie').length}`);
}

// Export for API use
export { seedIngredients };

// Run seed if executed directly (only when running as a standalone script)
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        seedIngredients();
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}
