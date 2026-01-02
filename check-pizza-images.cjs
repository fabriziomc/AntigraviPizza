const Database = require('better-sqlite3').default || require('better-sqlite3');

console.log('\n=== VERIFICA IMMAGINI PIZZE ===\n');

const db = new Database('./antigravipizza.db');

try {
    const recipes = db.prepare('SELECT id, name, imageUrl FROM Recipes LIMIT 10').all();

    console.log(`Totale pizze analizzate: ${recipes.length}\n`);

    recipes.forEach((recipe, idx) => {
        console.log(`${idx + 1}. ${recipe.name}`);
        console.log(`   imageUrl: ${recipe.imageUrl ? 'Presente' : '❌ Mancante'}`);
        if (recipe.imageUrl) {
            console.log(`   Has turbo? ${recipe.imageUrl.includes('model=turbo') ? '✅' : '❌ NO (vecchio URL)'}`);
            console.log(`   URL: ${recipe.imageUrl.substring(0, 100)}...`);
        }
        console.log('');
    });

    // Stats
    const stats = {
        total: recipes.length,
        withUrl: recipes.filter(r => r.imageUrl && r.imageUrl.trim() !== '').length,
        withTurbo: recipes.filter(r => r.imageUrl && r.imageUrl.includes('model=turbo')).length,
        missing: recipes.filter(r => !r.imageUrl || r.imageUrl.trim() === '').length
    };

    console.log('='.repeat(80));
    console.log('📊 STATISTICHE:');
    console.log(`   Totale pizze: ${stats.total}`);
    console.log(`   Con imageUrl: ${stats.withUrl}`);
    console.log(`   Con turbo model: ${stats.withTurbo}`);
    console.log(`   Senza imageUrl: ${stats.missing}`);
    console.log(`   Con vecchio URL (senza turbo): ${stats.withUrl - stats.withTurbo}`);
    console.log('='.repeat(80) + '\n');

    db.close();
} catch (error) {
    console.error('❌ Errore:', error.message);
    db.close();
}
