import sql from 'mssql';
import dotenv from 'dotenv';

// Load .env.mssql explicitly (not the default .env)
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

let pool = null;

/**
 * Get or create connection pool
 */
export async function getPool() {
    if (!pool) {
        pool = await sql.connect(config);
        console.log(`✅ Connected to SQL Server: ${config.server}/${config.database}`);
    }
    return pool;
}

/**
 * Execute a query with parameters
 */
export async function query(queryText, params = {}) {
    const pool = await getPool();
    const request = pool.request();

    // Add parameters
    for (const [key, value] of Object.entries(params)) {
        request.input(key, value);
    }

    return await request.query(queryText);
}

/**
 * Execute a stored procedure
 */
export async function execute(procedureName, params = {}) {
    const pool = await getPool();
    const request = pool.request();

    // Add parameters
    for (const [key, value] of Object.entries(params)) {
        request.input(key, value);
    }

    return await request.execute(procedureName);
}

/**
 * Close the connection pool
 */
export async function closePool() {
    if (pool) {
        await pool.close();
        pool = null;
        console.log('✅ SQL Server connection closed');
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    await closePool();
    process.exit(0);
});

export { sql };
