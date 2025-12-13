import Database from 'better-sqlite3';

const db = new Database('./antigravipizza.db');

console.log('🔍 Checking preparations with null time or difficulty...\n');

const preps = db.prepare('SELECT id, name, time, difficulty FROM Preparations').all();

const nullTime = preps.filter(p => !p.time);
const nullDifficulty = preps.filter(p => !p.difficulty);

console.log(`📊 Total preparations: ${preps.length}`);
console.log(`⚠️ Preparations with null time: ${nullTime.length}`);
console.log(`⚠️ Preparations with null difficulty: ${nullDifficulty.length}\n`);

if (nullTime.length > 0) {
    console.log('Preparations with null time:');
    nullTime.forEach(p => console.log(`  - ${p.name} (${p.id})`));
    console.log('');
}

if (nullDifficulty.length > 0) {
    console.log('Preparations with null difficulty:');
    nullDifficulty.forEach(p => console.log(`  - ${p.name} (${p.id})`));
}

db.close();
