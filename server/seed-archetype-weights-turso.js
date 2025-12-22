// ============================================
// SEED ARCHETYPE WEIGHTS FOR TURSO
// ============================================

import { getDb } from './db.js';

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
    }
];

async function seedArchetypeWeightsTurso() {
    console.log('🌱 Starting archetype weights seed for Turso...\n');

    const db = getDb();
    const isTurso = typeof db?.execute === 'function';

    if (!isTurso) {
        console.error('❌ This script is for Turso only!');
        return;
    }

    let inserted = 0;
    const now = Date.now();

    for (const aw of ARCHETYPE_WEIGHTS) {
        try {
            const id = `aw-default-${aw.archetype}`;

            await db.execute({
                sql: `INSERT OR IGNORE INTO ArchetypeWeights (id, userId, archetype, weight, description, dateModified)
                      VALUES (?, ?, ?, ?, ?, ?)`,
                args: [id, 'default', aw.archetype, aw.weight, aw.description, now]
            });

            inserted++;
            console.log(`✅ Inserted: ${aw.archetype} (${aw.weight}%)`);
        } catch (err) {
            console.error(`❌ Error inserting ${aw.archetype}:`, err.message);
        }
    }

    console.log(`\n✅ Seeded ${inserted} archetype weights`);
    console.log(`\n📊 Weight Distribution:`);
    ARCHETYPE_WEIGHTS.forEach(aw => {
        console.log(`   - ${aw.archetype}: ${aw.weight}%`);
    });

    // Verify
    const result = await db.execute('SELECT * FROM ArchetypeWeights WHERE userId = ?', ['default']);
    console.log(`\n🔍 Verification: ${result.rows.length} weights in database`);
}

seedArchetypeWeightsTurso().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
