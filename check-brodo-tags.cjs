const Database = require('better-sqlite3').default || require('better-sqlite3');

console.log('\n=== ANALISI INGREDIENTI BRODO ===\n');

const db = new Database('./antigravipizza.db');

try {
    // Cerca brodo e brodo vegetale
    const brodoIngredients = db.prepare(`
    SELECT id, name, tags
    FROM Ingredients 
    WHERE name LIKE '%brodo%' OR name LIKE '%Brodo%'
  `).all();

    console.log(`Trovati ${brodoIngredients.length} ingredienti contenenti "brodo":\n`);

    brodoIngredients.forEach((ing, idx) => {
        const tags = JSON.parse(ing.tags || '[]');
        console.log(`${idx + 1}. ${ing.name}`);
        console.log(`   ID: ${ing.id}`);
        console.log(`   Tags: [${tags.join(', ')}]`);
        console.log(`   Ha base_oil? ${tags.includes('base_oil') ? '❌ SÌ (PROBLEMA!)' : '✅ NO'}\n`);
    });

    // Verifica se hanno base_oil
    const withBaseOil = brodoIngredients.filter(ing => {
        const tags = JSON.parse(ing.tags || '[]');
        return tags.includes('base_oil');
    });

    if (withBaseOil.length > 0) {
        console.log('💡 AZIONE RICHIESTA:');
        console.log(`   Rimuovere tag "base_oil" da ${withBaseOil.length} ingredienti\n`);
        withBaseOil.forEach(ing => {
            console.log(`   - ${ing.name} (${ing.id})`);
        });
    } else {
        console.log('✅ Nessun ingrediente brodo ha il tag base_oil');
    }

} catch (error) {
    console.error('❌ Errore:', error.message);
} finally {
    db.close();
}
