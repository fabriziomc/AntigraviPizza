import Database from 'better-sqlite3';

const db = new Database('./antigravipizza.db');

console.log('🔄 Updating preparations with time and difficulty...\n');

// Define time and difficulty based on category
const categoryDefaults = {
    'Preparazioni Base': { prepTime: '10-15 min', difficulty: 'Facile' },
    'Pesce': { prepTime: '20-30 min', difficulty: 'Media' },
    'Verdure': { prepTime: '15-20 min', difficulty: 'Facile' },
    'Salse': { prepTime: '10-15 min', difficulty: 'Facile' },
    'Creme': { prepTime: '20-25 min', difficulty: 'Facile' },
    'Carne': { prepTime: '30-45 min', difficulty: 'Media' },
    'Dolci': { prepTime: '25-35 min', difficulty: 'Media' },
    'Basi': { prepTime: '10-15 min', difficulty: 'Facile' },
    'Condimenti': { prepTime: '15-20 min', difficulty: 'Facile' }
};

// Special cases for specific preparations
const specialCases = {
    'Stracotto di manzo': { prepTime: '2-3 ore', difficulty: 'Difficile' },
    'Anatra': { prepTime: '45-60 min', difficulty: 'Difficile' },
    'Baccalà mantecato': { prepTime: '30-40 min', difficulty: 'Media' },
    'Ragù napoletano': { prepTime: '2-3 ore', difficulty: 'Media' },
    'Pomodoro stracotto': { prepTime: '1-2 ore', difficulty: 'Media' },
    'Coralli viola': { prepTime: '40-50 min', difficulty: 'Difficile' },
    'Tonno Tataki': { prepTime: '15-20 min', difficulty: 'Media' },
    'Tartare di Fassona': { prepTime: '15-20 min', difficulty: 'Media' },
    'Tartare di Gamberi': { prepTime: '20-25 min', difficulty: 'Media' }
};

const preps = db.prepare('SELECT id, name, category, prepTime, difficulty FROM Preparations').all();

const stmt = db.prepare(`
    UPDATE Preparations 
    SET prepTime = ?, difficulty = ? 
    WHERE id = ?
`);

let updated = 0;

preps.forEach(prep => {
    // Skip if already has values
    if (prep.prepTime && prep.difficulty) {
        return;
    }

    let prepTime, difficulty;

    // Check for special cases first
    if (specialCases[prep.name]) {
        prepTime = specialCases[prep.name].prepTime;
        difficulty = specialCases[prep.name].difficulty;
    } else if (categoryDefaults[prep.category]) {
        // Use category defaults
        prepTime = categoryDefaults[prep.category].prepTime;
        difficulty = categoryDefaults[prep.category].difficulty;
    } else {
        // Fallback defaults
        prepTime = '15-20 min';
        difficulty = 'Facile';
    }

    stmt.run(prepTime, difficulty, prep.id);
    updated++;
    console.log(`✅ ${prep.name}: ${prepTime}, ${difficulty}`);
});

db.close();

console.log(`\n✅ Updated ${updated} preparations`);
