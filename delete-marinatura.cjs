const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== ELIMINAZIONE INGREDIENTE ERRATO DA TURSO ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

// ID confermato da eliminare
const idToDelete = '7cab8d3f-ca9b-44ca-8695-7781e4bb4a99'; // marinatura: Salsa di soia

async function deleteIngredient() {
    try {
        console.log('Recupero dettagli ingrediente...\n');

        const result = await turso.execute({
            sql: 'SELECT name FROM Ingredients WHERE id = ?',
            args: [idToDelete]
        });

        if (result.rows.length === 0) {
            console.log('❌ Ingrediente non trovato in Turso\n');
            return;
        }

        const name = result.rows[0].name;
        console.log(`Ingrediente da eliminare: "${name}"`);
        console.log(`ID: ${idToDelete}\n`);

        console.log('Procedo con l\'eliminazione...\n');

        await turso.execute({
            sql: 'DELETE FROM Ingredients WHERE id = ?',
            args: [idToDelete]
        });

        console.log(`✅ Eliminato: "${name}"\n`);

        // Ver ifica conteggio finale
        const totalResult = await turso.execute('SELECT COUNT(*) as count FROM Ingredients');
        console.log('='.repeat(80));
        console.log(`\nIngredienti rimanenti in Turso: ${totalResult.rows[0].count}`);
        console.log(`Atteso: 271`);
        console.log(`Differenza: ${totalResult.rows[0].count - 271}\n`);

    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

deleteIngredient();
