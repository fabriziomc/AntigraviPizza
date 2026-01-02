import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

// Prova diverse configurazioni per trovare quella funzionante
const configs = [
    // Config 1: Standard con porta esplicita
    {
        name: 'Standard con porta',
        config: {
            server: process.env.DB_SERVER,
            port: 1433,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            options: {
                encrypt: false,
                trustServerCertificate: true,
                enableArithAbort: true
            }
        }
    },
    // Config 2: Con connectionTimeout aumentato
    {
        name: 'Timeout aumentato',
        config: {
            server: process.env.DB_SERVER,
            port: 1433,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionTimeout: 30000,
            requestTimeout: 30000,
            options: {
                encrypt: false,
                trustServerCertificate: true,
                enableArithAbort: true,
                instanceName: ''
            }
        }
    },
    // Config 3: Connection string diretta
    {
        name: 'Connection String',
        config: `Server=${process.env.DB_SERVER},1433;Database=${process.env.DB_DATABASE};User Id=${process.env.DB_USER};Password=${process.env.DB_PASSWORD};Encrypt=false;TrustServerCertificate=true;`
    },
    // Config 4: Con dominio esplicito (se necessario)
    {
        name: 'Con dominio',
        config: {
            server: process.env.DB_SERVER,
            port: 1433,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            domain: '',
            options: {
                encrypt: false,
                trustServerCertificate: true,
                enableArithAbort: true
            }
        }
    }
];

async function testConfigs() {
    console.log('========================================');
    console.log('  TEST CONFIGURAZIONI SQL SERVER');
    console.log('========================================\n');
    console.log(`Server: ${process.env.DB_SERVER}`);
    console.log(`Database: ${process.env.DB_DATABASE}`);
    console.log(`User: ${process.env.DB_USER}\n`);

    for (const { name, config } of configs) {
        console.log(`\n🔧 Testando: ${name}`);
        console.log('─'.repeat(50));

        try {
            const pool = await sql.connect(config);
            console.log('✅ CONNESSIONE RIUSCITA!');

            const result = await pool.request().query('SELECT @@VERSION AS version');
            console.log('✅ Query eseguita con successo');
            console.log(`📊 SQL Server: ${result.recordset[0].version.split('\n')[0]}`);

            await pool.close();

            console.log('\n🎉 CONFIGURAZIONE FUNZIONANTE TROVATA!');
            console.log('Usa questa configurazione:');
            console.log(JSON.stringify(config, null, 2));

            return { name, config };

        } catch (err) {
            console.log(`❌ Errore: ${err.message}`);
            if (err.code) {
                console.log(`   Codice: ${err.code}`);
            }
        }
    }

    console.log('\n\n❌ Nessuna configurazione funzionante trovata');
    console.log('\nPossibili cause:');
    console.log('1. SQL Server non configurato per autenticazione SQL');
    console.log('2. Utente "sa" disabilitato');
    console.log('3. TCP/IP non abilitato in SQL Server');
    console.log('4. Firewall blocca la porta 1433');
    console.log('5. Password contiene caratteri speciali non gestiti');

    return null;
}

testConfigs().then(result => {
    if (result) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});
