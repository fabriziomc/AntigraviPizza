import Database from 'better-sqlite3';

const db = new Database('./antigravipizza.db');

console.log('🔍 Checking Preparations with problematic ingredients...\n');

const preps = db.prepare('SELECT * FROM Preparations').all();

preps.forEach(prep => {
    const ingredients = JSON.parse(prep.ingredients || '[]');

    if (ingredients.length > 0) {
        const hasUndefinedNames = ingredients.some(ing => !ing.name);

        if (hasUndefinedNames) {
            console.log(`❌ ${prep.name} (${prep.category})`);
            console.log(`   Ingredients:`, JSON.stringify(ingredients, null, 2));
            console.log('');
        }
    }
});

db.close();
