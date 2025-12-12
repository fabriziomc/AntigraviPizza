// ============================================
// SEED PREPARATIONS - Populate Preparations Table
// ============================================

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database di preparazioni
const PREPARATIONS_DB = [
    {
        name: 'Uova strapazzate',
        description: 'Tuorlo d\'uovo e latte in stessa quantità cuocere in microonde fino a rassodamento. Poi stracciare',
        ingredients: ['Uova', 'Latte'],
        category: 'Preparazioni Base',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Coralli viola',
        description: 'Bollire le patate viola intere senza buccia, dopodiché congelare e una volta raggiunta la temperatura ideale, grattugiare su di un foglio di carta forno e cuocere a 60/70 gradi',
        ingredients: ['Patate viola'],
        category: 'Preparazioni Base',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Baccalà mantecato',
        description: 'https://ricette.giallozafferano.it/Baccala-mantecato-alla-veneziana.html',
        ingredients: ['Stoccafisso ammollato', 'Alloro', 'Prezzemolo'],
        category: 'Pesce',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Cipolla caramellata',
        description: 'https://www.google.com/amp/s/www.cucchiaio.it/ricetta/cipolle-rosse-caramellate.amp.html',
        ingredients: ['Cipolle Tropea', 'Zucchero di canna'],
        category: 'Verdure',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Pomodorini confit',
        description: 'https://ricette.giallozafferano.it/Pomodori-confit.html',
        ingredients: ['Pomodorini', 'Zucchero di canna', 'Worchester', 'Tabasco'],
        category: 'Verdure',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Pomodoro stracotto',
        description: 'https://www.youtube.com/watch?v=WUBtcW7L540',
        ingredients: ['Polpa di pomodoro', 'Cipolla', 'Carote', 'Aglio'],
        category: 'Salse',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Crema di patate',
        description: 'Soffriggere nell\'olio il sedano, la carota e la cipolla, unire le patate a pasta gialla e cuocere fino a quando diventano tenere',
        ingredients: ['Sedano', 'Carota', 'Cipolla', 'Patate'],
        category: 'Creme',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Patate in crosta',
        description: 'https://blog.giallozafferano.it/allacciateilgrembiule/patate-a-fette-in-padella/',
        ingredients: ['Patate', 'Aglio', 'Rosmarino'],
        category: 'Verdure',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Cavolo nero stufato',
        description: 'Bollire il cavolo nero dopo averlo privato della costa centrale. Poi ripassare in padella con aglio, olio e peperoncino',
        ingredients: ['Cavolo nero', 'Aglio', 'Peperoncino'],
        category: 'Verdure',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Crema di patate viola',
        description: 'Soffriggere nell\'olio il sedano, la carota e la cipolla, unire le patate viola e cuocere fino a quando diventano tenere',
        ingredients: ['Sedano', 'Carota', 'Cipolla', 'Patate viola'],
        category: 'Creme',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Crema di zucchine',
        description: 'https://ricette.giallozafferano.it/Vellutata-di-zucchine.html',
        ingredients: ['Zucchine', 'Porri', 'Panna'],
        category: 'Creme',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Pomodori secchi (crema)',
        description: 'Frullare il tutto a crudo',
        ingredients: ['Pomodori secchi', 'Olio', 'Aglio', 'Peperoncino', 'Origano', 'Timo', 'Capperi'],
        category: 'Creme',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Crema di friarielli',
        description: 'https://blog.giallozafferano.it/pasticcidigiu/ricetta-penne-con-crema-di-friarielli-e-salsiccia/',
        ingredients: ['Friarielli'],
        category: 'Creme',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Crema di castagne',
        description: '100 gr di farina di castagne, 1 bicchiere di latte e 1 di acqua, sale, pepe, olio. Mettere sul fuoco molto basso fino a che si forma una crema morbida',
        ingredients: ['Farina di castagne', 'Latte'],
        category: 'Creme',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Crema di ceci',
        description: 'https://blog.giallozafferano.it/cucinanonnalina/crema-di-ceci-ricetta-veloce-e-economica/',
        ingredients: ['Ceci', 'Rosmarino'],
        category: 'Creme',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Crema di barbabietola',
        description: 'https://www.misya.info/ricetta/crema-alle-barbabietole.htm',
        ingredients: ['Barbabietola', 'Yogurt'],
        category: 'Creme',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Dadolata di patate',
        description: 'Friggere le patate a pasta gialla tagliate a piccoli cubetti (anche friggitrice ad aria)',
        ingredients: ['Patate'],
        category: 'Verdure',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Guacamole',
        description: 'https://ricette.giallozafferano.it/Guacamole.html',
        ingredients: ['Avocado', 'Lime'],
        category: 'Salse',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Salsa al mango',
        description: 'Frullare mango con olio, sale, pepe e (opzionale) senape',
        ingredients: ['Mango', 'Senape'],
        category: 'Salse',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Gel di agrumi',
        description: 'https://www.youtube.com/watch?v=guCAaGCH_Mc',
        ingredients: ['Arancia', 'Limone', 'Zucchero', 'Agar Agar'],
        category: 'Salse',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Tartare di Gamberi',
        description: 'Pulire gamberi, unire lime, menta, cocco, kiwi, sale e pepe',
        ingredients: ['Gamberi', 'Lime', 'Menta', 'Cocco', 'Kiwi'],
        category: 'Pesce',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Composta pere e zenzero',
        description: 'https://ricette.giallozafferano.it/Confettura-pere-e-zenzero.html',
        ingredients: ['Pere', 'Zucchero di canna', 'Zenzero', 'Limone'],
        category: 'Dolci',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Salsa di pistacchi',
        description: 'https://www.tavolartegusto.it/ricetta/pesto-di-pistacchio-ricetta/',
        ingredients: ['Pistacchi', 'Parmigiano', 'Basilico'],
        category: 'Salse',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Crema di piselli',
        description: 'https://www.lacucinaitaliana.it/article/vellutata-di-piselli-ricetta-facile-cremosa-leggera/',
        ingredients: ['Piselli', 'Panna', 'Cipolla'],
        category: 'Creme',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Crema di pecorino',
        description: 'https://blog.giallozafferano.it/melogranierose/crema-di-pecorino-per-condire-o-spalmare/',
        ingredients: ['Pecorino', 'Burro', 'Latte', 'Farina'],
        category: 'Creme',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Baccalà in vasocottura',
        description: 'https://blog.giallozafferano.it/neltegamesulfuoco/baccala-in-oliocottura-in-vasocottura/',
        ingredients: ['Baccalà', 'Prezzemolo'],
        category: 'Pesce',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Anatra',
        description: 'https://www.cookaround.com/ricetta/petto-d-anatra-all-arancia.html',
        ingredients: ['Anatra', 'Arancia', 'Miele', 'Burro', 'Timo'],
        category: 'Carne',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Stracotto di manzo',
        description: 'https://ricette.giallozafferano.it/Stracotto-di-manzo.html',
        ingredients: ['Carne', 'Brodo di carne', 'Vino rosso', 'Aglio', 'Cipolla', 'Carota', 'Sedano'],
        category: 'Carne',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Melanzane grigliate',
        description: 'Grigliare a fette verticali sottili',
        ingredients: ['Melanzane'],
        category: 'Verdure',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Finocchi grigliati',
        description: 'https://blog.giallozafferano.it/piovonoricette/ricetta-finocchi-grigliati/',
        ingredients: ['Finocchi'],
        category: 'Verdure',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Emulsione di aglio nero',
        description: 'https://www.nonnapaperina.it/2015/09/emulsione-allaglio-nero-salsa/',
        ingredients: ['Aglio nero'],
        category: 'Salse',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Crema di Melone',
        description: 'Frullare melone e aggiungere olio per emulsionare. Aggiustare di sale e pepe',
        ingredients: ['Melone'],
        category: 'Creme',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Tartare di Fassona',
        description: 'https://blog.giallozafferano.it/cucinaconsara/tartare-di-fassona-piemontese/',
        ingredients: ['Fassona', 'Limone', 'Parmigiano'],
        category: 'Carne',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Tonno Tataki',
        description: 'https://blog.giallozafferano.it/cioccovaniglia/tataki-di-tonno/',
        ingredients: ['Filetti di tonno', 'Semi di Sesamo', 'Salsa di Soia', 'Miele', 'Zenzero'],
        category: 'Pesce',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Manzo marinato',
        description: 'Marinatura: Salsa di soia, Aceto balsamico, Zenzero, Peperoncino',
        ingredients: ['Carpaccio di manzo', 'Salsa di soia', 'Aceto Balsamico', 'Zenzero', 'Peperoncino'],
        category: 'Carne',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Pesto di rucola',
        description: 'https://ricette.giallozafferano.it/Pesto-di-rucola.html',
        ingredients: ['Rucola', 'Pinoli', 'Pecorino', 'Parmigiano'],
        category: 'Salse',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Uovo marinato',
        description: 'Marinare uova in salamoia',
        ingredients: ['Uova', 'Sale'],
        category: 'Preparazioni Base',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Salsa aioli',
        description: 'https://ricette.giallozafferano.it/Aioli.html',
        ingredients: ['Uova', 'Olio', 'Aglio', 'Limone'],
        category: 'Salse',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Verza e Patate',
        description: 'https://ricette.giallozafferano.it/Pizzoccheri-alla-valtellinese.html',
        ingredients: ['Patate', 'Verza', 'Burro', 'Aglio', 'Parmigiano'],
        category: 'Verdure',
        phase: 'topping',
        postBake: false
    },
    {
        name: 'Chips di grano saraceno',
        description: 'Creare chips croccanti con farina di grano saraceno',
        ingredients: ['Farina Grano saraceno', 'Farina 00'],
        category: 'Preparazioni Base',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Maionese al wasabi',
        description: 'https://blog.giallozafferano.it/cucinoperpassione/maionese-al-wasabi/',
        ingredients: ['Uova', 'Olio', 'Wasabi', 'Limone'],
        category: 'Salse',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Ananas caramellato',
        description: 'https://blog.giallozafferano.it/crisemaxincucina/ananas-caramellato/',
        ingredients: ['Ananas', 'Burro', 'Zucchero di canna'],
        category: 'Dolci',
        phase: 'topping',
        postBake: true
    },
    {
        name: 'Ragù napoletano',
        description: 'Ragù tradizionale napoletano con carne mista',
        ingredients: ['Carne macinata', 'Pomodoro', 'Cipolla', 'Carota', 'Sedano', 'Vino rosso'],
        category: 'Salse',
        phase: 'topping',
        postBake: false
    }
];

function generateId(name) {
    return `prep-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function seedPreparations() {
    const dbPath = path.join(__dirname, '..', 'antigravipizza.db');
    const db = new Database(dbPath);

    console.log('🌱 Starting preparations seed...');

    const now = Date.now();

    // Insert in batch - matching actual schema columns
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO Preparations (id, name, description, ingredients, category, dateAdded, isCustom)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    let inserted = 0;
    PREPARATIONS_DB.forEach(prep => {
        try {
            const result = stmt.run(
                generateId(prep.name),
                prep.name,
                prep.description,
                JSON.stringify(prep.ingredients),
                prep.category,
                now,
                0 // isCustom = 0 for seeded preparations
            );
            if (result.changes > 0) inserted++;
        } catch (err) {
            console.error(`Error inserting ${prep.name}:`, err.message);
        }
    });

    db.close();

    console.log(`✅ Seeded ${inserted} preparations (${PREPARATIONS_DB.length} total in source)`);
    console.log(`📊 Categories:`);
    console.log(`   - Creme: ${PREPARATIONS_DB.filter(p => p.category === 'Creme').length}`);
    console.log(`   - Salse: ${PREPARATIONS_DB.filter(p => p.category === 'Salse').length}`);
    console.log(`   - Verdure: ${PREPARATIONS_DB.filter(p => p.category === 'Verdure').length}`);
    console.log(`   - Pesce: ${PREPARATIONS_DB.filter(p => p.category === 'Pesce').length}`);
    console.log(`   - Carne: ${PREPARATIONS_DB.filter(p => p.category === 'Carne').length}`);
    console.log(`   - Dolci: ${PREPARATIONS_DB.filter(p => p.category === 'Dolci').length}`);
    console.log(`   - Preparazioni Base: ${PREPARATIONS_DB.filter(p => p.category === 'Preparazioni Base').length}`);
}

// Export for API use
export { seedPreparations };

// Run seed if executed directly (not via import)
if (import.meta.url === `file://${process.argv[1]}`) {
    seedPreparations().catch(console.error);
}
