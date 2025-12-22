// ============================================
// UPDATE TURSO WEIGHTS - Add Missing Archetypes
// ============================================

import { getDb } from './db.js';

const MISSING_ARCHETYPES = [
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

async function updateTursoWeights() {
    console.log('🌱 Aggiornamento pesi archetipi su Turso...\n');

    const db = getDb();
    const isTurso = typeof db?.execute === 'function';

    if (!isTurso) {
        console.error('❌ Errore: DB_TYPE deve essere "turso"!');
        console.log('💡 Assicurati che il file .env abbia DB_TYPE=turso');
        process.exit(1);
    }

    let inserted = 0;
    const now = Date.now();

    for (const aw of MISSING_ARCHETYPES) {
        try {
            const id = `aw-default-${aw.archetype}`;

            await db.execute({
                sql: `INSERT OR REPLACE INTO ArchetypeWeights (id, userId, archetype, weight, description, dateModified)
                      VALUES (?, ?, ?, ?, ?, ?)`,
                args: [id, 'default', aw.archetype, aw.weight, aw.description, now]
            });

            inserted++;
            console.log(`✅ Aggiunto: ${aw.archetype} (${aw.weight}%)`);
        } catch (err) {
            console.error(`❌ Errore con ${aw.archetype}:`, err.message);
        }
    }

    // Verifica tutti i pesi
    const result = await db.execute('SELECT archetype, weight FROM ArchetypeWeights WHERE userId = ? ORDER BY weight DESC', ['default']);

    console.log(`\n✅ Aggiornati ${inserted} archetipi mancanti`);
    console.log('\n📊 Tutti i Pesi nel Database Turso:');
    console.log('====================================');
    result.rows.forEach(row => {
        console.log(`  ${row.archetype.toString().padEnd(25)} ${row.weight}%`);
    });
    console.log('====================================');
    console.log(`Totale archetipi: ${result.rows.length}\n`);
}

updateTursoWeights().catch(err => {
    console.error('❌ Errore fatale:', err);
    process.exit(1);
});
