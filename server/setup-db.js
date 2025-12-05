import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
    server: process.env.DB_SERVER,
    database: 'master',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

console.log('========================================');
console.log('  SETUP DATABASE SQL SERVER');
console.log(`  Server: ${config.server}`);
console.log(`  Database: ${process.env.DB_DATABASE}`);
console.log('========================================\n');

async function setupDatabase() {
    try {
        console.log('🔌 Connessione a SQL Server...');
        const pool = await sql.connect(config);
        console.log('✅ Connesso!\n');

        const schemaPath = path.join(__dirname, 'sql', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        const batches = schema.split(/\nGO\r?\n/i).filter(b => b.trim().length > 0);

        console.log(`📝 Esecuzione di ${batches.length} batch SQL...\n`);

        for (let i = 0; i < batches.length; i++) {
            console.log(`   [${i + 1}/${batches.length}] Esecuzione batch...`);
            await pool.request().query(batches[i]);
        }

        console.log('\n========================================');
        console.log('✅ DATABASE SETUP COMPLETATO!');
        console.log('========================================\n');

        await pool.close();
    } catch (err) {
        const errorLogPath = path.join(__dirname, 'error.log');
        let errorMsg = `Error setting up database: ${err.message}\n`;
        if (err.originalError) {
            errorMsg += `Original Error: ${err.originalError.message}\n`;
            errorMsg += `Stack: ${err.originalError.stack}\n`;
        }
        errorMsg += `Full Error: ${JSON.stringify(err, null, 2)}\n`;
        fs.writeFileSync(errorLogPath, errorMsg);
        console.error('\n========================================');
        console.error('❌ ERRORE!');
        console.error('========================================');
        console.error(err.message);
        console.error(`\n📁 Dettagli salvati in: ${errorLogPath}\n`);
        process.exit(1);
    }
}

setupDatabase();

