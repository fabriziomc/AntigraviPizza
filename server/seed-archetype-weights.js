// ============================================
// SEED ARCHETYPE WEIGHTS - Populate Default Weights
// ============================================

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARCHETYPE_WEIGHTS = [
    {
        archetype: 'combinazioni_db',
        weight: 30,
        description: 'Combinazioni salvate nel database'
    },
    {
        archetype: 'classica',
        weight: 28,
        description: 'Margherita, Marinara style'
    },
    {
        archetype: 'tradizionale',
        weight: 21,
        description: 'Prosciutto, Funghi, Capricciosa'
    },
    {
        archetype: 'terra_bosco',
        weight: 7,
        description: 'Funghi porcini, tartufo'
    },
    {
        archetype: 'fresca_estiva',
        weight: 7,
        description: 'Verdure, pomodorini'
    },
    {
        archetype: 'piccante_decisa',
        weight: 4,
        description: 'Nduja, peperoncino'
    },
    {
        archetype: 'mare',
        weight: 2,
        description: 'Pesce, frutti di mare'
    },
    {
        archetype: 'vegana',
        weight: 1,
        description: 'Solo vegetali'
    },
    {
        archetype: 'dolce_salato',
        weight: 3,
        description: 'Equilibrio dolce/salato'
    },
    {
        archetype: 'fusion',
        weight: 2,
        description: 'Interpretazioni creative e contemporanee'
    }
];

export function seedArchetypeWeights() {
    const dbPath = path.join(__dirname, '..', 'antigravipizza.db');
    const db = new Database(dbPath);

    console.log('🌱 Starting archetype weights seed...');

    const stmt = db.prepare(`
        INSERT OR IGNORE INTO ArchetypeWeights (id, userId, archetype, weight, description, dateModified)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    let inserted = 0;
    const now = Date.now();

    ARCHETYPE_WEIGHTS.forEach(aw => {
        try {
            const id = `aw-default-${aw.archetype}`;
            const result = stmt.run(
                id,
                'default',
                aw.archetype,
                aw.weight,
                aw.description,
                now
            );
            if (result.changes > 0) inserted++;
        } catch (err) {
            console.error(`Error inserting ${aw.archetype}:`, err.message);
        }
    });

    db.close();

    console.log(`✅ Seeded ${inserted} archetype weights (${ARCHETYPE_WEIGHTS.length} total in source)`);
    console.log(`📊 Distribution:`);
    ARCHETYPE_WEIGHTS.forEach(aw => {
        console.log(`   - ${aw.archetype}: ${aw.weight}%`);
    });
}

// Run seed if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedArchetypeWeights();
}
