// DEBUG SCRIPT - Incolla questo nella console del browser (F12)
// per vedere cosa contiene effettivamente una ricetta nel database

(async () => {
    try {
        const { getAllRecipes } = await import('./src/modules/database.js');
        const recipes = await getAllRecipes();

        console.log('=== DEBUG RICETTE ===');
        console.log(`Totale ricette: ${recipes.length}`);

        if (recipes.length > 0) {
            const firstRecipe = recipes[0];
            console.log('\n📋 Prima ricetta:', firstRecipe.name);
            console.log('📊 Campi presenti:', Object.keys(firstRecipe));
            console.log('\n🛒 baseIngredients:', firstRecipe.baseIngredients);
            console.log('🛒 ingredients (vecchio):', firstRecipe.ingredients);
            console.log('\n🥫 preparations:', firstRecipe.preparations);
            console.log('\n📝 Ricetta completa:', firstRecipe);
        } else {
            console.log('❌ Nessuna ricetta trovata');
        }
    } catch (error) {
        console.error('❌ Errore:', error);
    }
})();
