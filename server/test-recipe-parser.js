/**
 * Test script for recipe parser
 * Tests parsing of Italian recipe text format
 */

import { parseRecipeFile, validateRecipeData, suggestIngredientCategory } from './recipeParser.js';
import fs from 'fs';

// Read test file
const testFile = fs.readFileSync('./test-recipes.txt', 'utf-8');

console.log('🧪 Testing Recipe Parser\n');
console.log('='.repeat(60));

// Parse recipes
const recipes = parseRecipeFile(testFile);

console.log(`\n✅ Parsed ${recipes.length} recipes\n`);

// Display each recipe
recipes.forEach((recipe, index) => {
    console.log(`\n${index + 1}. ${recipe.name}`);
    console.log('-'.repeat(60));

    console.log(`📝 Description: ${recipe.description.substring(0, 80)}...`);

    console.log(`\n🥘 Base Ingredients (${recipe.baseIngredients.length}):`);
    recipe.baseIngredients.forEach(ing => {
        const category = suggestIngredientCategory(ing.name);
        console.log(`   • ${ing.originalName} (${ing.quantity || 'q.b.'} ${ing.unit})`);
        console.log(`     → Normalized: "${ing.name}" | Category: ${category}`);
    });

    if (recipe.toppingsDuringBake.length > 0) {
        console.log(`\n🔥 Toppings During Bake (${recipe.toppingsDuringBake.length}):`);
        recipe.toppingsDuringBake.forEach(ing => {
            const category = suggestIngredientCategory(ing.name);
            console.log(`   • ${ing.originalName} (${ing.quantity || 'q.b.'} ${ing.unit})`);
            console.log(`     → Normalized: "${ing.name}" | Category: ${category}`);
        });
    }

    if (recipe.toppingsPostBake.length > 0) {
        console.log(`\n❄️  Toppings Post Bake (${recipe.toppingsPostBake.length}):`);
        recipe.toppingsPostBake.forEach(ing => {
            const category = suggestIngredientCategory(ing.name);
            console.log(`   • ${ing.originalName} (${ing.quantity || 'q.b.'} ${ing.unit})`);
            console.log(`     → Normalized: "${ing.name}" | Category: ${category}`);
        });
    }

    console.log(`\n📋 Instructions (${recipe.instructions.length} steps):`);
    recipe.instructions.forEach((step, i) => {
        console.log(`   ${i + 1}. ${step}`);
    });

    // Validate
    const validation = validateRecipeData(recipe);
    console.log(`\n✔️  Validation: ${validation.valid ? 'PASSED' : 'FAILED'}`);
    if (!validation.valid) {
        console.log(`   Errors: ${validation.errors.join(', ')}`);
    }
});

console.log('\n' + '='.repeat(60));
console.log('✅ Test completed successfully!');
