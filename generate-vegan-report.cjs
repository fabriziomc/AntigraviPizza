const Database = require('better-sqlite3').default || require('better-sqlite3');
const fs = require('fs');

console.log('\n=== REPORT PIZZE VEGANE ===\n');

const db = new Database('./antigravipizza.db');

let report = '';

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

    report += '='.repeat(80) + '\n';
    report += 'REPORT: PIZZE POTENZIALMENTE VEGANE\n';
    report += '='.repeat(80) + '\n\n';
    report += `Trovate ${potentiallyVegan.length} pizze potenzialmente vegane\n\n`;

    potentiallyVegan.forEach((recipe, idx) => {
        report += `-`.repeat(80) + '\n';
        report += `\n${idx + 1}. ${recipe.name}\n`;
        report += `   ID: ${recipe.id}\n`;
        report += `   Tags attuali: [${recipe.tags.join(', ')}]\n`;
        if (recipe.description) {
            report += `   Descrizione: ${recipe.description}\n`;
        }
        report += `\n   Ingredienti (${recipe.ingredients.length}):\n`;
        recipe.ingredients.forEach(ing => {
            report += `     - ${ing.name}`;
            if (ing.quantity && ing.unit) {
                report += ` (${ing.quantity} ${ing.unit})`;
            }
            if (ing.category) {
                report += ` - Categoria: ${ing.category}`;
            }
            report += '\n';
        });
        report += '\n';
    });

    report += '='.repeat(80) + '\n';
    report += '\nVERIFICA:\n';
    report += 'Tutti gli ingredienti di queste pizze sono 100% vegetali?\n';
    report += 'Se sì, possiamo aggiungere il tag "Vegana"\n\n';

    // Save to file
    fs.writeFileSync('vegan-pizzas-report.txt', report);
    console.log(report);
    console.log('✅ Report salvato in: vegan-pizzas-report.txt\n');

} catch (error) {
    console.error('❌ Errore:', error.message);
} finally {
    db.close();
}
