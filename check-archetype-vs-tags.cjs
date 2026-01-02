const Database = require('better-sqlite3').default || require('better-sqlite3');

console.log('\n=== ANALISI PIZZE ARCHETIPO VEGANA ===\n');

const db = new Database('./antigravipizza.db');

try {
    // Cerca pizze con archetypeUsed = 'vegana'
    const veganArchetype = db.prepare(`
    SELECT id, name, archetypeUsed, tags 
    FROM Recipes 
    WHERE archetypeUsed = 'vegana'
  `).all();

    console.log(`✅ Pizze con archetypeUsed='vegana': ${veganArchetype.length}\n`);

    if (veganArchetype.length > 0) {
        console.log('Prime 5 pizze:\n');
        veganArchetype.slice(0, 5).forEach((recipe, idx) => {
            const tags = JSON.parse(recipe.tags || '[]');
            console.log(`${idx + 1}. ${recipe.name}`);
            console.log(`   Archetipo: ${recipe.archetypeUsed}`);
            console.log(`   Tags: [${tags.join(', ')}]`);
            console.log(`   Ha tag "Vegana"? ${tags.includes('Vegana') ? '✅ SÌ' : '❌ NO'}\n`);
        });

        // Conta quante hanno il tag
        const withTag = veganArchetype.filter(r => {
            const tags = JSON.parse(r.tags || '[]');
            return tags.includes('Vegana');
        });

        console.log('='.repeat(80));
        console.log('\n📊 RIEPILOGO\n');
        console.log(`  Pizze con archetypeUsed='vegana': ${veganArchetype.length}`);
        console.log(`  Pizze con tag "Vegana": ${withTag.length}`);
        console.log(`  Pizze SENZA tag "Vegana": ${veganArchetype.length - withTag.length}\n`);

        console.log('💡 PROBLEMA IDENTIFICATO:');
        console.log('   Le pizze hanno archetypeUsed ma non il tag!');
        console.log('   Il filtro cerca solo nei tags, quindi non le trova.\n');
    }

} catch (error) {
    console.error('❌ Errore:', error.message);
} finally {
    db.close();
}
