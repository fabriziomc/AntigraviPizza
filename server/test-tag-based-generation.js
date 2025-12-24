/**
 * Test script per verificare il nuovo sistema di generazione basato su tag
 * Genera 50 pizze e analizza la varietà degli ingredienti
 */

import { generateMultipleRecipes } from '../src/modules/recipeGenerator.js';

console.log('🧪 TEST: Tag-Based Recipe Generation');
console.log('Generando 50 pizze per analizzare la varietà...\n');

const NUM_PIZZAS = 50;

try {
    const recipes = await generateMultipleRecipes(NUM_PIZZAS);

    console.log(`✅ Generate ${recipes.length} pizze con successo!\n`);

    // Analizza varietà per archetipo
    const archetypeStats = {};

    recipes.forEach(recipe => {
        const archetype = recipe.archetypeUsed || 'unknown';

        if (!archetypeStats[archetype]) {
            archetypeStats[archetype] = {
                count: 0,
                ingredients: new Set(),
                pizzaNames: []
            };
        }

        archetypeStats[archetype].count++;
        archetypeStats[archetype].pizzaNames.push(recipe.name);

        // Conta ingredienti unici
        if (recipe.baseIngredients) {
            recipe.baseIngredients.forEach(ing => {
                archetypeStats[archetype].ingredients.add(ing.name);
            });
        }
    });

    // Report statistiche
    console.log('📊 STATISTICHE VARIETÀ PER ARCHETIPO:');
    console.log('='.repeat(70));

    Object.entries(archetypeStats).forEach(([archetype, stats]) => {
        console.log(`\n🏷️  ${archetype.toUpperCase()}`);
        console.log(`   Pizze generate: ${stats.count}`);
        console.log(`   Ingredienti unici: ${stats.ingredients.size}`);
        console.log(`   Esempi pizze:`);
        stats.pizzaNames.slice(0, 3).forEach(name => {
            console.log(`      - ${name}`);
        });

        // Calcola varietà
        if (stats.count > 0) {
            const varietyRatio = stats.ingredients.size / stats.count;
            console.log(`   📈 Ratio varietà: ${varietyRatio.toFixed(2)} ingredienti/pizza`);
        }
    });

    console.log('\n' + '='.repeat(70));

    // Analisi globale
    const totalIngredients = new Set();
    recipes.forEach(recipe => {
        if (recipe.baseIngredients) {
            recipe.baseIngredients.forEach(ing => totalIngredients.add(ing.name));
        }
    });

    console.log('\n📊 STATISTICHE GLOBALI:');
    console.log(`   Pizze totali: ${recipes.length}`);
    console.log(`   Ingredienti unici usati: ${totalIngredients.size}`);
    console.log(`   Media ingredienti/pizza: ${(totalIngredients.size / recipes.length).toFixed(2)}`);

    // Trova ingrediente più usato
    const ingredientCount = {};
    recipes.forEach(recipe => {
        if (recipe.baseIngredients) {
            recipe.baseIngredients.forEach(ing => {
                ingredientCount[ing.name] = (ingredientCount[ing.name] || 0) + 1;
            });
        }
    });

    const sortedIngredients = Object.entries(ingredientCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    console.log('\n🔝 TOP 10 INGREDIENTI PIÙ USATI:');
    sortedIngredients.forEach(([name, count], index) => {
        const percentage = (count / recipes.length * 100).toFixed(1);
        console.log(`   ${index + 1}. ${name}: ${count} volte (${percentage}%)`);
    });

    // Verifica criteri di successo
    console.log('\n✅ CRITERI DI SUCCESSO:');

    let allValid = true;

    // Criterio 1: Ogni archetipo ha almeno 8 ingredienti unici
    Object.entries(archetypeStats).forEach(([archetype, stats]) => {
        if (stats.count > 0) {
            const hasVariety = stats.ingredients.size >= 8;
            const status = hasVariety ? '✅' : '❌';
            console.log(`   ${status} ${archetype}: ${stats.ingredients.size} ingredienti unici (min: 8)`);
            if (!hasVariety) allValid = false;
        }
    });

    // Criterio 2: Nessun ingrediente appare in >50% delle pizze
    const maxPercentage = Math.max(...Object.values(ingredientCount).map(c => c / recipes.length * 100));
    const dominanceCheck = maxPercentage < 50;
    const status2 = dominanceCheck ? '✅' : '❌';
    console.log(`   ${status2} Nessun ingrediente domina: max ${maxPercentage.toFixed(1)}% (limite: 50%)`);
    if (!dominanceCheck) allValid = false;

    // Criterio 3: Almeno 30 ingredienti unici usati in totale
    const totalIngCheck = totalIngredients.size >= 30;
    const status3 = totalIngCheck ? '✅' : '❌';
    console.log(`   ${status3} Varietà globale: ${totalIngredients.size} ingredienti (min: 30)`);
    if (!totalIngCheck) allValid = false;

    console.log('\n' + '='.repeat(70));

    if (allValid) {
        console.log('\n🎉 TUTTI I CRITERI DI SUCCESSO SONO STATI SODDISFATTI!');
        console.log('Il sistema di tagging funziona correttamente.\n');
        process.exit(0);
    } else {
        console.log('\n⚠️  ALCUNI CRITERI NON SONO STATI SODDISFATTI');
        console.log('Potrebbe essere necessario aggiustare i tag o i mapping.\n');
        process.exit(1);
    }

} catch (error) {
    console.error('\n❌ ERRORE durante il test:', error.message);
    console.error(error.stack);
    process.exit(1);
}
