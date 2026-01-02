const Database = require('better-sqlite3').default || require('better-sqlite3');

console.log('\n=== ANALISI PIZZE VEGANE ===\n');

const db = new Database('./antigravipizza.db');

try {
    // 1. Conta tutte le ricette
    const totalRecipes = db.prepare('SELECT COUNT(*) as count FROM Recipes').get();
    console.log(`📊 Totale ricette nel database: ${totalRecipes.count}\n`);

    // 2. Cerca ricette con tag "Vegana"
    console.log('🔍 Ricerca ricette taggate come "Vegana"...\n');

    const veganTaggedRecipes = db.prepare(`
    SELECT id, name, tags FROM Recipes 
    WHERE tags LIKE '%Vegana%'
  `).all();

    console.log(`✅ Ricette con tag "Vegana": ${veganTaggedRecipes.length}\n`);

    if (veganTaggedRecipes.length > 0) {
        console.log('Elenco pizze vegane taggate:\n');
        veganTaggedRecipes.forEach((recipe, idx) => {
            const tags = JSON.parse(recipe.tags || '[]');
            console.log(`  ${idx + 1}. ${recipe.name}`);
            console.log(`     Tags: ${tags.join(', ')}\n`);
        });
    }

    // 3. Cerca ricette con tag "Vegetariana" per confronto
    console.log('='.repeat(80));
    console.log('\n🥗 Ricerca ricette taggate come "Vegetariana"...\n');

    const vegetarianRecipes = db.prepare(`
    SELECT id, name, tags FROM Recipes 
    WHERE tags LIKE '%Vegetariana%'
  `).all();

    console.log(`✅ Ricette con tag "Vegetariana": ${vegetarianRecipes.length}\n`);

    if (vegetarianRecipes.length > 0) {
        console.log('Prime 5 pizze vegetariane:\n');
        vegetarianRecipes.slice(0, 5).forEach((recipe, idx) => {
            const tags = JSON.parse(recipe.tags || '[]');
            console.log(`  ${idx + 1}. ${recipe.name}`);
            console.log(`     Tags: ${tags.join(', ')}\n`);
        });
    }

    // 4. Analisi ingredienti per trovare potenziali pizze vegane non taggate
    console.log('='.repeat(80));
    console.log('\n🌱 Analisi ingredienti per trovare pizze potenzialmente vegane...\n');

    const allRecipes = db.prepare('SELECT id, name, baseIngredients, tags FROM Recipes').all();

    const nonDairyKeywords = ['formaggi', 'formaggio', 'mozzarella', 'ricotta', 'parmigiano',
        'pecorino', 'gorgonzola', 'burrata', 'stracciatella', 'caciocavallo',
        'provolone', 'stracchino', 'taleggio', 'fontina', 'brie', 'caprino',
        'latte', 'panna', 'burro', 'uova', 'uovo', 'miele'];

    const potentiallyVegan = [];

    allRecipes.forEach(recipe => {
        try {
            const ingredients = JSON.parse(recipe.baseIngredients || '[]');
            const tags = JSON.parse(recipe.tags || '[]');

            // Skip if already tagged as Vegana
            if (tags.includes('Vegana')) return;

            // Check if contains dairy/animal products
            const hasDairy = ingredients.some(ing => {
                const name = (ing.name || '').toLowerCase();
                return nonDairyKeywords.some(keyword => name.includes(keyword));
            });

            // Check for meat/fish
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
                    ingredients: ingredients.map(i => i.name).join(', ')
                });
            }
        } catch (e) {
            // Skip recipes with parsing errors
        }
    });

    console.log(`🔍 Pizze potenzialmente vegane (senza latticini/carne): ${potentiallyVegan.length}\n`);

    if (potentiallyVegan.length > 0) {
        console.log('Elenco:\n');
        potentiallyVegan.forEach((recipe, idx) => {
            console.log(`  ${idx + 1}. ${recipe.name}`);
            console.log(`     Tags attuali: ${recipe.tags.join(', ') || 'nessuno'}`);
            console.log(`     Ingredienti: ${recipe.ingredients.substring(0, 80)}...\n`);
        });
    }

    // 5. Riepilogo
    console.log('='.repeat(80));
    console.log('\n📊 RIEPILOGO\n');
    console.log(`  Totale ricette: ${totalRecipes.count}`);
    console.log(`  Taggate "Vegana": ${veganTaggedRecipes.length}`);
    console.log(`  Taggate "Vegetariana": ${vegetarianRecipes.length}`);
    console.log(`  Potenzialmente vegane non taggate: ${potentiallyVegan.length}\n`);
    console.log('='.repeat(80) + '\n');

} catch (error) {
    console.error('❌ Errore:', error.message);
} finally {
    db.close();
}
