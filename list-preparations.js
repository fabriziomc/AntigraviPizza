import Database from 'better-sqlite3';

const db = new Database('./antigravipizza.db');

console.log('📋 Preparazioni nel database:\n');
const preps = db.prepare('SELECT id, name, category FROM Preparations').all();
preps.forEach(p => {
    console.log(`  ${p.id}`);
    console.log(`    Nome: ${p.name}`);
    console.log(`    Categoria: ${p.category}`);
    console.log('');
});

console.log(`\nTotale: ${preps.length} preparazioni`);

db.close();
