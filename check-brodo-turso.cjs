const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== ANALISI BRODO IN TURSO ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

async function checkBrodoTags() {
    try {
        // Cerca brodo in Turso
        const result = await turso.execute({
            sql: "SELECT id, name, tags FROM Ingredients WHERE name LIKE '%brodo%' OR name LIKE '%Brodo%'",
            args: []
        });

        console.log(`Trovati ${result.rows.length} ingredienti contenenti "brodo" in Turso:\n`);

        const problematicOnes = [];

        result.rows.forEach((ing, idx) => {
            const tags = JSON.parse(ing.tags || '[]');
            const hasBaseOil = tags.includes('base_oil');

            console.log(`${idx + 1}. ${ing.name}`);
            console.log(`   ID: ${ing.id}`);
            console.log(`   Tags: [${tags.join(', ')}]`);
            console.log(`   Ha base_oil? ${hasBaseOil ? '❌ SÌ (PROBLEMA!)' : '✅ NO'}\n`);

            if (hasBaseOil) {
                problematicOnes.push({
                    id: ing.id,
                    name: ing.name,
                    tags: tags
                });
            }
        });

        if (problematicOnes.length > 0) {
            console.log('='.repeat(80));
            console.log('\n💡 AZIONE RICHIESTA:\n');
            console.log(`Rimuovere tag "base_oil" da ${problematicOnes.length} ingredienti:\n`);

            problematicOnes.forEach(ing => {
                const newTags = ing.tags.filter(t => t !== 'base_oil');
                console.log(`  ${ing.name}:`);
                console.log(`    Prima:  [${ing.tags.join(', ')}]`);
                console.log(`    Dopo:   [${newTags.join(', ')}]\n`);
            });
        } else {
            console.log('✅ Nessun ingrediente brodo ha il tag base_oil in Turso');
        }

    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

checkBrodoTags();
