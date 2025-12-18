
import { query } from './server/db-mssql.js';

async function checkTables() {
    try {
        console.log('🔍 Checking tables in SQL Server...');
        const result = await query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        `);
        console.log('📋 Tables found:');
        result.recordset.forEach(row => console.log(` - ${row.TABLE_NAME}`));
        process.exit(0);
    } catch (err) {
        console.error('💥 Error:', err.message);
        process.exit(1);
    }
}

checkTables();
