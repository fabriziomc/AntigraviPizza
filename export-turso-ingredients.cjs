const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== EXPORT TUTTI GLI INGREDIENTI DA TURSO ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

async function exportAllIngredients() {
    try {
        console.log('Scarico TUTTI gli ingredienti da Turso...\n');

        const result = await turso.execute({
            sql: 'SELECT id, name, categoryId FROM Ingredients ORDER BY name',
            args: []
        });

        console.log(`Totale ingredienti trovati: ${result.rows.length}\n`);

        // Salva in un file
        let output = '='.repeat(100) + '\n';
        output += 'TUTTI GLI INGREDIENTI IN TURSO (Ordinati alfabeticamente)\n';
        output += '='.repeat(100) + '\n\n';
        output += `Totale: ${result.rows.length} ingredienti\n\n`;

        result.rows.forEach((ing, index) => {
            output += `${String(index + 1).padStart(3)}. ${ing.name}\n`;
            output += `     ID: ${ing.id}\n`;
            output += `     Categoria: ${ing.categoryId}\n\n`;
        });

        fs.writeFileSync('turso-all-ingredients.txt', output);

        console.log('✅ Esportato in: turso-all-ingredients.txt\n');

        // Cerca pattern sospetti
        console.log('🔍 Ricerca pattern sospetti...\n');

        const suspicious = result.rows.filter(ing => {
            const name = ing.name.toLowerCase();
            return (
                name.includes('frullare') ||
                name.includes('marinatura') ||
                name.includes('soffriggere') ||
                name.includes('bicchiere') ||
                name.match(/^\d+\s*(gr|grammi|ml|litri)/i) ||
                name.includes('poi ') ||
                name.match(/\d+\s*minut/i)
            );
        });

        if (suspicious.length > 0) {
            console.log(`❗ Trovati ${suspicious.length} ingredienti sospetti:\n`);
            suspicious.forEach((ing, idx) => {
                console.log(`${idx + 1}. "${ing.name}"`);
                console.log(`   ID: ${ing.id}\n`);
            });

            console.log('\n=== ID DA ELIMINARE ===\n');
            suspicious.forEach(ing => console.log(`'${ing.id}',`));
            console.log('\n');
        } else {
            console.log('Nessun ingrediente con pattern sospetti trovato.\n');
        }

    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

exportAllIngredients();
