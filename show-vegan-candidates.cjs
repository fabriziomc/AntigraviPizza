const Database = require('better-sqlite3').default || require('better-sqlite3');

console.log('\n=== DETTAGLIO PIZZE POTENZIALMENTE VEGANE ===\n');

const db = new Database('./antigravipizza.db');

try {
    const allRecipes = db.prepare('SELECT id, name, baseIngredients, tags, description FROM Recipes').all();

    const nonDairyKeywords = ['formaggi', 'formaggio', 'mozzarella', 'ricotta', 'parmigiano',
        'pecorino', 'gorgonzola', 'burrata', 'stracciatella', 'caciocavallo',
        'provolone', 'stracchino', 'taleggio', 'fontina', 'brie', 'caprino',
        'latte', 'panna', 'burro', 'uova', 'uovo', 'miele'];

    const potentiallyVegan = [];

    allRecipes.forEach(recipe => {
        try {
            const ingredients = JSON.parse(recipe.baseIngredients || '[]');
            const tags = JSON.parse(recipe.tags || '[]');

            if (tags.includes('Vegana')) return;

            const hasDairy = ingredients.some(ing => {
                const name = (ing.name || '').toLowerCase();
                return nonDairyKeywords.some(keyword => name.includes(keyword));
            });

            const hasMeat = ingredients.some(ing => {
                const name = (ing.name || '').toLowerCase();
                const category = (ing.category || '').toLowerCase();
                return category.includes('carne') || category.includes('pesce') ||
                    category.includes('salumi') || name.includes('salsiccia') ||
                    name.includes('prosciutto') || name.includes('speck');
            });

            if (!hasDairy && !hasMeat && ingredients.length > 0) {
                potentiallyVegan.push({
                    name: recipe.name,
                    id: recipe.id,
                    tags: tags,
                    description: recipe.description,
                    ingredients: ingredients
                });
            }
        } catch (e) {
            // Skip
        }
    });

    console.log(`Trovate ${potentiallyVegan.length} pizze potenzialmente vegane:\n`);

    potentiallyVegan.forEach((recipe, idx) => {
        console.log(`${idx + 1}. ${recipe.name}`);
        console.log(`   ID: ${recipe.id}`);
        console.log(`   Tags attuali: [${recipe.tags.join(', ')}]`);
        if (recipe.description) {
            console.log(`   Descrizione: ${recipe.description.substring(0, 100)}${recipe.description.length > 100 ? '...' : ''}`);
        }
        console.log(`   Ingredienti (${recipe.ingredients.length}):`);
        recipe.ingredients.forEach(ing => {
            console.log(`     - ${ing.name} (${ing.quantity || ''} ${ing.unit || ''})`);
        });
        console.log('');
    });

    console.log('='.repeat(80));
    console.log('\n💡 DECISIONE NECESSARIA:\n');
    console.log('Queste pizze dovrebbero avere il tag "Vegana"?');
    console.log('Verifica che tutti gli ingredienti siano effettivamente vegetali.\n');

} catch (error) {
    console.error('❌ Errore:', error.message);
} finally {
    db.close();
}
