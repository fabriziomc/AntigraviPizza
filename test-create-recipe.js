import DatabaseAdapter from './server/db-adapter.js';

const dbAdapter = new DatabaseAdapter();

// Test recipe with data similar to what the generator would send
const testRecipe = {
    id: `recipe-test-${Date.now()}`,
    name: 'Test Pizza',
    pizzaiolo: 'Generator',
    source: 'generated',
    description: 'Test recipe',
    baseIngredients: [
        { name: 'Pomodoro', categoryId: 1 },
        { name: 'Mozzarella', categoryId: 2 }
    ],
    preparations: [],
    instructions: [
        { step: 1, text: 'Test instruction' }
    ],
    imageUrl: '',
    dough: '',
    suggestedDough: '',
    archetype: 'classica',
    recipeSource: 'generator',
    archetypeUsed: 'classica',
    createdAt: Date.now(),
    dateAdded: Date.now(),
    isFavorite: false,
    rating: 0,
    tags: ['rossa']
};

console.log('Testing recipe creation...');
console.log('Recipe data:', JSON.stringify(testRecipe, null, 2));

try {
    const result = await dbAdapter.createRecipe(testRecipe);
    console.log('✅ Recipe created successfully:', result);
} catch (err) {
    console.error('❌ Error creating recipe:', err);
    console.error('❌ Error message:', err.message);
    console.error('❌ Error stack:', err.stack);
}

process.exit(0);
