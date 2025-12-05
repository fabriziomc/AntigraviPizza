import dotenv from 'dotenv';
import sql from 'mssql';

// Load .env.mssql explicitly
dotenv.config({ path: '.env.mssql' });

// Helper function to strip surrounding quotes from env values
function stripQuotes(value) {
    if (!value) return value;
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1);
    }
    return value;
}

const config = {
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: stripQuotes(process.env.DB_PASSWORD),
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

console.log('Testing with explicit .env.mssql load...');
console.log('Config:', {
    server: config.server,
    user: config.user,
    password: '***',
    database: config.database
});

async function test() {
    try {
        console.log('\n🔌 Connecting...');
        const pool = await sql.connect(config);
        console.log('✅ Connected!');

        const result = await pool.request().query('SELECT @@VERSION AS version, DB_NAME() AS dbname');
        console.log('\n📊 Result:');
        console.log(result.recordset[0]);

        await pool.close();
        console.log('\n✅ Test successful!');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Error:', err.message);
        console.error('Code:', err.code);
        process.exit(1);
    }
}

test();
