// ============================================
// CREATE AND SEED ARCHETYPE WEIGHTS TABLE
// ============================================

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

console.log('📊 Creating ArchetypeWeights table...');

// Create table
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

// Seed data
const ARCHETYPE_WEIGHTS = [
    { archetype: 'combinazioni_db', weight: 30, description: 'Combinazioni salvate nel database' },
    { archetype: 'classica', weight: 28, description: 'Margherita, Marinara style' },
    { archetype: 'tradizionale', weight: 21, description: 'Prosciutto, Funghi, Capricciosa' },
    { archetype: 'terra_bosco', weight: 7, description: 'Funghi porcini, tartufo' },
    { archetype: 'fresca_estiva', weight: 7, description: 'Verdure, pomodorini' },
    { archetype: 'piccante_decisa', weight: 4, description: 'Nduja, peperoncino' },
    { archetype: 'mare', weight: 2, description: 'Pesce, frutti di mare' },
    { archetype: 'vegana', weight: 1, description: 'Solo vegetali' },
    { archetype: 'dolce_salato', weight: 3, description: 'Equilibrio dolce/salato' },
    { archetype: 'fusion', weight: 2, description: 'Interpretazioni creative e contemporanee' }
];

console.log('🌱 Seeding archetype weights...');

const stmt = db.prepare(`
    INSERT OR REPLACE INTO ArchetypeWeights (id, userId, archetype, weight, description, dateModified)
    VALUES (?, ?, ?, ?, ?, ?)
`);

const now = Date.now();
let inserted = 0;

ARCHETYPE_WEIGHTS.forEach(aw => {
    const id = `aw-default-${aw.archetype}`;
    const result = stmt.run(id, 'default', aw.archetype, aw.weight, aw.description, now);
    if (result.changes > 0) inserted++;
});

db.close();

console.log(`✅ Seeded ${inserted} archetype weights`);
console.log(`📊 Distribution:`);
ARCHETYPE_WEIGHTS.forEach(aw => {
    console.log(`   - ${aw.archetype}: ${aw.weight}%`);
});
