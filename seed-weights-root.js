import Database from 'better-sqlite3';

const db = new Database('antigravipizza.db');

console.log('📊 Creating ArchetypeWeights table in ROOT database...');

db.exec(`
CREATE TABLE IF NOT EXISTS ArchetypeWeights (
    id TEXT PRIMARY KEY,
    userId TEXT DEFAULT 'default',
    archetype TEXT NOT NULL,
    weight INTEGER NOT NULL,
    description TEXT,
    dateModified INTEGER NOT NULL,
    UNIQUE(userId, archetype)
);

CREATE INDEX IF NOT EXISTS idx_archetype_weights_user ON ArchetypeWeights(userId);
`);

console.log('✅ Table created');

const weights = [
    { archetype: 'combinazioni_db', weight: 30, description: 'Combinazioni salvate nel database' },
    { archetype: 'classica', weight: 28, description: 'Margherita, Marinara style' },
    { archetype: 'tradizionale', weight: 21, description: 'Prosciutto, Funghi, Capricciosa' },
    { archetype: 'terra_bosco', weight: 7, description: 'Funghi porcini, tartufo' },
    { archetype: 'fresca_estiva', weight: 7, description: 'Verdure, pomodorini' },
    { archetype: 'piccante_decisa', weight: 4, description: 'Nduja, peperoncino' },
    { archetype: 'mare', weight: 2, description: 'Pesce, frutti di mare' },
    { archetype: 'vegana', weight: 1, description: 'Solo vegetali' }
];

const stmt = db.prepare(`
    INSERT OR REPLACE INTO ArchetypeWeights (id, userId, archetype, weight, description, dateModified)
    VALUES (?, ?, ?, ?, ?, ?)
`);

const now = Date.now();
weights.forEach(w => {
    stmt.run(`aw-default-${w.archetype}`, 'default', w.archetype, w.weight, w.description, now);
});

db.close();

console.log('✅ Seeded 8 archetype weights in ROOT database');
console.log('📊 Distribution:');
weights.forEach(w => {
    console.log(`   - ${w.archetype}: ${w.weight}%`);
});
