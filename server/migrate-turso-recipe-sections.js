import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error('❌ TURSO_DATABASE_URL e TURSO_AUTH_TOKEN devono essere configurati nel file .env');
    process.exit(1);
}

const db = createClient({ url, authToken });

async function migrate() {
    try {
        console.log('🔧 Connessione a Turso...');
        console.log(`   URL: ${url}`);

        // Verifica colonne esistenti
        const result = await db.execute('PRAGMA table_info(Recipes)');
        const columns = result.rows.map(row => row.name);

        console.log('\n📋 Colonne attuali nella tabella Recipes:');
        columns.forEach(col => console.log(`   - ${col}`));

        const hasToppingsDuring = columns.includes('toppingsDuringBake');
        const hasToppingsPost = columns.includes('toppingsPostBake');

        if (!hasToppingsDuring) {
            console.log('\n➕ Aggiunta colonna toppingsDuringBake...');
            await db.execute('ALTER TABLE Recipes ADD COLUMN toppingsDuringBake TEXT');
            console.log('✅ Colonna toppingsDuringBake aggiunta');
        } else {
            console.log('\n✓ Colonna toppingsDuringBake già presente');
        }

        if (!hasToppingsPost) {
            console.log('➕ Aggiunta colonna toppingsPostBake...');
            await db.execute('ALTER TABLE Recipes ADD COLUMN toppingsPostBake TEXT');
            console.log('✅ Colonna toppingsPostBake aggiunta');
        } else {
            console.log('✓ Colonna toppingsPostBake già presente');
        }

        // Verifica finale
        const finalResult = await db.execute('PRAGMA table_info(Recipes)');
        const finalColumns = finalResult.rows.map(row => row.name);

        console.log('\n📋 Colonne finali nella tabella Recipes:');
        finalColumns.forEach(col => console.log(`   - ${col}`));

        console.log('\n✅ Migrazione completata con successo!');
    } catch (error) {
        console.error('❌ Errore durante la migrazione:', error.message);
        console.error(error);
        process.exit(1);
    }
}

migrate();
