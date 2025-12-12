// ============================================
// PIZZA OPTIMIZER - Test Script
// ============================================

import { generateOptimizedSet, completeOptimizedSet, calculateSetMetrics } from './pizzaOptimizer.js';

console.log('🧪 Testing Pizza Optimizer...\n');

// ============================================
// TEST 1: Automatic Mode
// ============================================

console.log('📊 TEST 1: Automatic Mode (5 pizzas)');
console.log('─'.repeat(50));

try {
    const result = await generateOptimizedSet(5);

    console.log(`\n✅ Generated ${result.pizzas.length} pizzas:`);
    result.pizzas.forEach((pizza, i) => {
        const ingredients = pizza.baseIngredients.map(ing => ing.name || ing).join(', ');
        console.log(`${i + 1}. ${pizza.name} (${pizza.archetype})`);
        console.log(`   Ingredienti: ${ingredients}`);
    });

    console.log(`\n📊 Metrics:`);
    console.log(`   Total Score: ${result.metrics.totalScore}/100`);
    console.log(`   Ingredient Reuse: ${result.metrics.ingredientReusePercent}%`);
    console.log(`   Preparation Reuse: ${result.metrics.preparationReusePercent}%`);
    console.log(`   Variety: ${result.metrics.varietyPercent}%`);
    console.log(`   Total Ingredients: ${result.metrics.totalIngredients}`);
    console.log(`   Shared Ingredients: ${result.metrics.sharedIngredients}`);

} catch (error) {
    console.error('❌ Test 1 failed:', error.message);
}

// ============================================
// TEST 2: Mixed Mode
// ============================================

console.log('\n\n📊 TEST 2: Mixed Mode (2 fixed + 3 generated)');
console.log('─'.repeat(50));

try {
    // Simulate 2 fixed pizzas
    const fixedPizzas = [
        {
            name: 'Margherita',
            archetype: 'classica',
            baseIngredients: [
                { name: 'Pomodoro' },
                { name: 'Mozzarella' },
                { name: 'Basilico' }
            ],
            preparations: []
        },
        {
            name: 'Diavola',
            archetype: 'piccante_decisa',
            baseIngredients: [
                { name: 'Pomodoro' },
                { name: 'Mozzarella' },
                { name: 'Salame piccante' }
            ],
            preparations: []
        }
    ];

    console.log('\n📌 Fixed pizzas:');
    fixedPizzas.forEach((pizza, i) => {
        const ingredients = pizza.baseIngredients.map(ing => ing.name).join(', ');
        console.log(`${i + 1}. ${pizza.name} - ${ingredients}`);
    });

    const result = await completeOptimizedSet(fixedPizzas, 3);

    console.log(`\n🤖 Generated suggestions:`);
    result.suggestions.forEach((pizza, i) => {
        const ingredients = pizza.baseIngredients.map(ing => ing.name || ing).join(', ');
        console.log(`${i + 1}. ${pizza.name} (${pizza.archetype})`);
        console.log(`   Ingredienti: ${ingredients}`);
    });

    console.log(`\n📊 Complete Set Metrics:`);
    console.log(`   Total Score: ${result.metrics.totalScore}/100`);
    console.log(`   Ingredient Reuse: ${result.metrics.ingredientReusePercent}%`);
    console.log(`   Total Ingredients: ${result.metrics.totalIngredients}`);
    console.log(`   Shared Ingredients: ${result.metrics.sharedIngredients}`);

    console.log(`\n📦 Ingredient List:`);
    result.metrics.ingredientList
        .sort((a, b) => b.count - a.count)
        .forEach(ing => {
            const marker = ing.shared ? '✓' : ' ';
            console.log(`   [${marker}] ${ing.name} (used in ${ing.count} pizzas)`);
        });

} catch (error) {
    console.error('❌ Test 2 failed:', error.message);
}

console.log('\n\n✅ Tests completed!');
