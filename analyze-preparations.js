import Database from 'better-sqlite3';

const db = new Database('./antigravipizza.db');

console.log('🔍 Analyzing preparations in database vs seed file...\n');

// Get all preparations from DB
const dbPreps = db.prepare('SELECT id, name, category FROM Preparations ORDER BY category, name').all();

// Seed preparations (from seed-preparations.js)
const seedPrepIds = [
    'prep-uova-strapazzate',
    'prep-coralli-viola',
    'prep-baccal-mantecato',
    'prep-cipolla-caramellata',
    'prep-pomodorini-confit',
    'prep-pomodoro-stracotto',
    'prep-crema-di-patate',
    'prep-patate-in-crosta',
    'prep-cavolo-nero-stufato',
    'prep-crema-di-patate-viola',
    'prep-crema-di-zucchine',
    'prep-pomodori-secchi-crema-',
    'prep-crema-di-friarielli',
    'prep-crema-di-castagne',
    'prep-crema-di-ceci',
    'prep-crema-di-barbabietola',
    'prep-dadolata-di-patate',
    'prep-guacamole',
    'prep-salsa-al-mango',
    'prep-gel-di-agrumi',
    'prep-tartare-di-gamberi',
    'prep-composta-pere-e-zenzero',
    'prep-salsa-di-pistacchi',
    'prep-crema-di-piselli',
    'prep-crema-di-pecorino',
    'prep-baccal-in-vasocottura',
    'prep-anatra',
    'prep-stracotto-di-manzo',
    'prep-melanzane-grigliate',
    'prep-finocchi-grigliati',
    'prep-emulsione-di-aglio-nero',
    'prep-crema-di-melone',
    'prep-tartare-di-fassona',
    'prep-tonno-tataki',
    'prep-manzo-marinato',
    'prep-pesto-di-rucola',
    'prep-uovo-marinato',
    'prep-salsa-aioli',
    'prep-verza-e-patate',
    'prep-chips-di-grano-saraceno',
    'prep-maionese-al-wasabi',
    'prep-ananas-caramellato',
    'prep-rag-napoletano'
];

console.log(`📊 Total in DB: ${dbPreps.length}`);
console.log(`📊 Total in seed: ${seedPrepIds.length}\n`);

// Find preparations in DB but NOT in seed
const missingInSeed = dbPreps.filter(p => !seedPrepIds.includes(p.id));

if (missingInSeed.length > 0) {
    console.log(`⚠️ Preparations in DB but NOT in seed (${missingInSeed.length}):\n`);
    missingInSeed.forEach(p => {
        console.log(`  ${p.id}`);
        console.log(`    Nome: ${p.name}`);
        console.log(`    Categoria: ${p.category}`);
        console.log('');
    });
} else {
    console.log('✅ All DB preparations are in seed file');
}

// Find preparations in seed but NOT in DB
const missingInDB = seedPrepIds.filter(id => !dbPreps.find(p => p.id === id));

if (missingInDB.length > 0) {
    console.log(`\n⚠️ Preparations in seed but NOT in DB (${missingInDB.length}):\n`);
    missingInDB.forEach(id => console.log(`  ${id}`));
}

db.close();
