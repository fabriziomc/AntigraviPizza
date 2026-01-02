import sql from 'mssql';

const config = {
    server: '10.1.1.140',
    user: 'sa',
    password: 'pass#123',
    database: 'AntigraviPizza',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

console.log('Testing connection with hardcoded values...');
console.log('Config:', JSON.stringify(config, null, 2));

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
        console.error('Original Error:', err.originalError?.message);
        console.error('\nFull error:', err);
        process.exit(1);
    }
}

test();
