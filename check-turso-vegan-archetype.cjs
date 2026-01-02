const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== ANALISI PIZZE VEGANE IN TURSO ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

async function analyzeVeganPizzas() {
    try {
        // Cerca pizze con archetypeUsed = 'vegana'
        const result = await turso.execute({
            sql: 'SELECT id, name, archetypeUsed, tags FROM Recipes WHERE archetypeUsed = ?',
            args: ['vegana']
        });

        console.log(`✅ Pizze con archetypeUsed='vegana' in Turso: ${result.rows.length}\n`);

        if (result.rows.length > 0) {
            console.log('Prime 5 pizze:\n');
            result.rows.slice(0, 5).forEach((recipe, idx) => {
                const tags = JSON.parse(recipe.tags || '[]');
                console.log(`${idx + 1}. ${recipe.name}`);
                console.log(`   Archetipo: ${recipe.archetypeUsed}`);
                console.log(`   Tags: [${tags.join(', ')}]`);
                console.log(`   Ha tag "Vegana"? ${tags.includes('Vegana') ? '✅ SÌ' : '❌ NO'}\n`);
            });

            // Conta quante hanno il tag
            const withTag = result.rows.filter(r => {
                const tags = JSON.parse(r.tags || '[]');
                return tags.includes('Vegana');
            });

            const withoutTag = result.rows.filter(r => {
                const tags = JSON.parse(r.tags || '[]');
                return !tags.includes('Vegana');
            });

            console.log('='.repeat(80));
            console.log('\n📊 RIEPILOGO\n');
            console.log(`  Totale pizze con archetypeUsed='vegana': ${result.rows.length}`);
            console.log(`  Pizze CON tag "Vegana": ${withTag.length}`);
            console.log(`  Pizze SENZA tag "Vegana": ${withoutTag.length}\n`);

            if (withoutTag.length > 0) {
                console.log('💡 SOLUZIONE:');
                console.log(`   Aggiungere il tag "Vegana" a ${withoutTag.length} pizze\n`);

                console.log('ID delle pizze da aggiornare:\n');
                withoutTag.forEach((r, idx) => {
                    console.log(`  ${idx + 1}. ${r.name} (${r.id})`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

analyzeVeganPizzas();
