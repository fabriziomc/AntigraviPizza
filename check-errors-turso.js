require('dotenv').config({ path: '.env.turso.example' });
const { createClient } = require('@libsql/client');

console.log('\n=== VERIFICA INGREDIENTI ERRATI IN TURSO ===\n');

// Connessione a Turso
const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// ID degli ingredienti errati
const errorIds = [
    'e0eeeaa7-4da6-4f4c-aa2e-8885c41c258a', // soffriggere nell'olio il sedano
    '804b0852-1ef0-4a34-84cf-99abca9cf955'  // 100 gr di farina di castagne
];

async function checkTurso() {
    try {
        console.log('Connessione a Turso...\n');

        console.log('Cerco ingredienti errati nel database Turso...\n');

        for (let i = 0; i < errorIds.length; i++) {
            const id = errorIds[i];
            const result = await turso.execute({
                sql: 'SELECT * FROM Ingredients WHERE id = ?',
                args: [id]
            });

            if (result.rows.length > 0) {
                const ing = result.rows[0];
                console.log(`✓ TROVATO [${i + 1}]:`);
                console.log(`  Nome: "${ing.name}"`);
                console.log(`  ID: ${id}`);
                console.log(`  Categoria: ${ing.categoryId}\n`);
            } else {
                console.log(`✗ NON TROVATO [${i + 1}]: ID ${id}\n`);
            }
        }

        // Cerca altri ingredienti sospetti
        console.log('='.repeat(80));
        console.log('\n🔍 Cerco altri ingredienti con pattern sospetti...\n');

        const patterns = [
            { pattern: '%frullare%', label: 'Contiene "frullare"' },
            { pattern: 'marinatura:%', label: 'Inizia con "marinatura:"' },
            { pattern: 'soffriggere%', label: 'Inizia con "soffriggere"' },
            { pattern: '%100 gr%', label: 'Contiene "100 gr"' }
        ];

        const allSuspicious = [];

        for (const { pattern, label } of patterns) {
            const result = await turso.execute({
                sql: 'SELECT id, name FROM Ingredients WHERE LOWER(name) LIKE LOWER(?)',
                args: [pattern]
            });

            if (result.rows.length > 0) {
                console.log(`📌 ${label}: ${result.rows.length} risultati`);
                result.rows.forEach(ing => {
                    console.log(`   - "${ing.name}" (ID: ${ing.id})`);
                    if (!allSuspicious.find(i => i.id === ing.id)) {
                        allSuspicious.push(ing);
                    }
                });
                console.log('');
            }
        }

        if (allSuspicious.length === 0) {
            console.log('Nessun altro ingrediente sospetto trovato.\n');
        }

        console.log('='.repeat(80));
        console.log('\n✅ Verifica completata\n');

    } catch (error) {
        console.error('❌ Errore durante la verifica Turso:', error.message);
        process.exit(1);
    }
}

checkTurso();
