import dotenv from 'dotenv';
import { getPool, closePool } from './db-mssql.js';

dotenv.config();

console.log('========================================');
console.log('  TEST CONNESSIONE SQL SERVER');
console.log('========================================');
console.log(`Server: ${process.env.DB_SERVER}`);
console.log(`Database: ${process.env.DB_DATABASE}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`Password: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}`);
console.log('========================================\n');

async function testConnection() {
    try {
        console.log('🔌 Tentativo di connessione...');
        const pool = await getPool();
        console.log('✅ Connessione riuscita!');

        const result = await pool.request().query('SELECT @@VERSION AS version');
        console.log('\n📊 Versione SQL Server:');
        console.log(result.recordset[0].version);

        await closePool();
        console.log('\n✅ Test completato con successo!');
    } catch (err) {
        console.error('\n❌ Errore di connessione:', err.message);
        console.error('Dettagli:', err);
        await closePool();
        process.exit(1);
    }
}

testConnection();
