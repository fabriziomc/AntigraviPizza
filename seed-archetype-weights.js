import Database from 'better-sqlite3';

const db = new Database('./antigravipizza.db');

console.log('🔍 Checking ArchetypeWeights table...');
const count = db.prepare('SELECT COUNT(*) as count FROM ArchetypeWeights').get();
console.log(`Current rows: ${count.count}`);

if (count.count === 0) {
    console.log('\n🌱 Seeding ArchetypeWeights...');

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

    const userId = 'default';
    const now = Date.now();

    const stmt = db.prepare(`
        INSERT INTO ArchetypeWeights (id, userId, archetype, weight, description, dateModified)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    weights.forEach(w => {
        const id = `aw-${userId}-${w.archetype}`;
        stmt.run(id, userId, w.archetype, w.weight, w.description, now);
        console.log(`  ✅ Inserted ${w.archetype}: ${w.weight}%`);
    });

    console.log('\n✅ ArchetypeWeights seeded successfully!');
} else {
    console.log('✅ ArchetypeWeights already populated');
    const weights = db.prepare('SELECT * FROM ArchetypeWeights WHERE userId = ?').all('default');
    weights.forEach(w => {
        console.log(`  - ${w.archetype}: ${w.weight}%`);
    });
}

db.close();
