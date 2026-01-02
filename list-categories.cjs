const { createClient } = require('@libsql/client');
const fs = require('fs');

console.log('\n=== LISTA TUTTE LE CATEGORIE IN TURSO ===\n');

// Carica credenziali Turso
const envBackup = fs.readFileSync('.env.backup', 'utf8');
const tursoUrl = envBackup.match(/TURSO_DATABASE_URL=(.+)/)?.[1]?.trim();
const tursoToken = envBackup.match(/TURSO_AUTH_TOKEN=(.+)/)?.[1]?.trim();

const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

async function listCategories() {
    try {
        const result = await turso.execute({
            sql: 'SELECT id, name, icon, displayOrder FROM Categories ORDER BY displayOrder',
            args: []
        });

        console.log(`Totale categorie: ${result.rows.length}\n`);

        result.rows.forEach((cat, idx) => {
            console.log(`${idx + 1}. ${cat.name}`);
            console.log(`   ID: ${cat.id}`);
            console.log(`   Icon: ${cat.icon || 'N/A'}`);
            console.log(`   Display Order: ${cat.displayOrder}\n`);
        });

    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

listCategories();
