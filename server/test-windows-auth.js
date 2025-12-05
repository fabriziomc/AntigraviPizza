import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sql = require('mssql/msnodesqlv8');
import dotenv from 'dotenv';

dotenv.config();

console.log('========================================');
console.log('  TEST WINDOWS AUTHENTICATION');
console.log('========================================\n');

// Configurazione con Windows Authentication
const config = {
    server: process.env.DB_SERVER,
    port: 1433,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        trustedConnection: true  // Windows Authentication
    },
    driver: 'msnodesqlv8' // Required for Windows Authentication
};

async function testWindowsAuth() {
    console.log('🔧 Tentativo con Windows Authentication...\n');
    console.log(`Server: ${process.env.DB_SERVER}`);
    console.log(`Database: ${process.env.DB_DATABASE}`);
    console.log(`Auth: Windows (current user)\n`);

    // Connection string for Windows Authentication with specific driver
    const connectionString = `server=${process.env.DB_SERVER};Database=${process.env.DB_DATABASE};Trusted_Connection=Yes;Driver=SQL Server`;

    try {
        console.log(`🔌 Connecting with string: ${connectionString}`);
        const pool = await sql.connect(connectionString);
        console.log('✅ CONNESSIONE RIUSCITA con Windows Auth!');

        const result = await pool.request().query('SELECT @@VERSION AS version, SYSTEM_USER AS currentUser');
        console.log('✅ Query eseguita con successo');
        console.log(`📊 SQL Server: ${result.recordset[0].version.split('\n')[0]}`);
        console.log(`👤 Utente connesso: ${result.recordset[0].currentUser}`);

        await pool.close();

        console.log('\n🎉 Windows Authentication funziona!');
        console.log('Aggiorna db-mssql.js per usare questa configurazione.');

        return true;

    } catch (err) {
        const fs = await import('fs');
        const errorLog = `
Error: ${err.message}
Code: ${err.code}
Stack: ${err.stack}
        `;
        fs.writeFileSync('error_log.txt', errorLog);

        console.log(`❌ Errore con Windows Auth: ${err.message}`);
        if (err.code) {
            console.log(`   Codice: ${err.code}`);
        }

        console.log('\n📋 DIAGNOSI COMPLETA:');
        console.log('─'.repeat(50));
        console.log('❌ SQL Authentication: FALLITA (ELOGIN)');
        console.log('❌ Windows Authentication: FALLITA');
        console.log('\n🔍 Il problema è probabilmente uno di questi:');
        console.log('\n1. SQL Server NON configurato per autenticazione SQL');
        console.log('   Soluzione: Abilitare "SQL Server and Windows Authentication mode"');
        console.log('   in SQL Server Management Studio > Server Properties > Security');
        console.log('\n2. Utente "sa" DISABILITATO');
        console.log('   Soluzione: Abilitare l\'utente sa in SSMS');
        console.log('\n3. TCP/IP NON ABILITATO');
        console.log('   Soluzione: Abilitare TCP/IP in SQL Server Configuration Manager');
        console.log('\n4. Password ERRATA o con caratteri speciali problematici');
        console.log('   Soluzione: Verificare/cambiare la password dell\'utente sa');
        console.log('\n5. SQL Server richiede ENCRYPTION');
        console.log('   Soluzione: Provare con encrypt: true nella configurazione');

        return false;
    }
}

testWindowsAuth().then(success => {
    process.exit(success ? 0 : 1);
});
