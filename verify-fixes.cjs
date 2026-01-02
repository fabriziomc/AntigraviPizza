const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== VERIFICA CORREZIONI ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

const carrotOnionId = '27df6ff3-7b70-4cc6-942e-a68af3667371';

async function verify() {
    try {
        // 1. Verifica che "la carota e la cipolla" sia stata eliminata
        console.log(`1️⃣ Verifica eliminazione "la carota e la cipolla"...\n`);

        const result1 = await turso.execute({
            sql: 'SELECT name FROM Ingredients WHERE id = ?',
            args: [carrotOnionId]
        });

        if (result1.rows.length === 0) {
            console.log('   ✅ Ingrediente eliminato con successo\n');
        } else {
            console.log(`   ❌ Ingrediente ancora presente: "${result1.rows[0].name}"\n`);
        }

        // 2. Verifica categoria "Erbe e Spezie"
        console.log('2️⃣ Verifica categoria "Erbe e Spezie"...\n');

        const herbCatResult = await turso.execute({
            sql: 'SELECT id FROM Categories WHERE LOWER(name) LIKE ?',
            args: ['%erbe%spezie%']
        });

        if (herbCatResult.rows.length > 0) {
            const herbCatId = herbCatResult.rows[0].id;

            const sweetKeywords = [
                'miele', 'cioccolat', 'confettura', 'scaglie', 'fragol',
                'arancia', 'liquirizia', 'riduzione di balsamico'
            ];

            const stillWrong = [];

            for (const keyword of sweetKeywords) {
                const result = await turso.execute({
                    sql: 'SELECT name FROM Ingredients WHERE categoryId = ? AND LOWER(name) LIKE ?',
                    args: [herbCatId, `%${keyword}%`]
                });

                result.rows.forEach(ing => {
                    if (!stillWrong.find(i => i.name === ing.name)) {
                        stillWrong.push(ing);
                    }
                });
            }

            if (stillWrong.length === 0) {
                console.log('   ✅ Nessun ingrediente dolce rimasto in "Erbe e Spezie"\n');
            } else {
                console.log(`   ⚠️  Ancora ${stillWrong.length} ingredienti dolci in "Erbe e Spezie":\n`);
                stillWrong.forEach(ing => console.log(`      - ${ing.name}`));
                console.log('');
            }
        }

        // 3. Conta totale ingredienti
        console.log('3️⃣ Conteggio finale...\n');

        const totalResult = await turso.execute('SELECT COUNT(*) as count FROM Ingredients');
        console.log(`   Ingredienti totali in Turso: ${totalResult.rows[0].count}`);
        console.log(`   Attesi: 271`);
        console.log(`   Differenza: ${totalResult.rows[0].count - 271}\n`);

        console.log('='.repeat(80));
        console.log('\n✅ VERIFICA COMPLETATA\n');

    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

verify();
