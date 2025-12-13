import Database from 'better-sqlite3';

const db = new Database('./antigravipizza.db');

console.log('🔍 Checking for similar ingredient names...\n');

const ingredients = db.prepare('SELECT name FROM Ingredients ORDER BY name').all();

// Group similar names
const similar = {};

ingredients.forEach((ing1, i) => {
    const name1 = ing1.name.toLowerCase().trim();

    ingredients.forEach((ing2, j) => {
        if (i >= j) return; // Skip same and already compared

        const name2 = ing2.name.toLowerCase().trim();

        // Check for similar names
        if (name1.includes(name2) || name2.includes(name1)) {
            const key = ing1.name.length < ing2.name.length ? ing1.name : ing2.name;
            if (!similar[key]) similar[key] = new Set();
            similar[key].add(ing1.name);
            similar[key].add(ing2.name);
        }
    });
});

// Print results
if (Object.keys(similar).length === 0) {
    console.log('✅ No similar ingredient names found');
} else {
    console.log('⚠️ Found similar ingredient names:\n');
    Object.entries(similar).forEach(([key, names]) => {
        console.log(`Group: ${key}`);
        Array.from(names).forEach(name => {
            console.log(`  - ${name}`);
        });
        console.log('');
    });
}

db.close();
