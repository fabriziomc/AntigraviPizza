
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './server/db-mssql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initSchema() {
    try {
        console.log('🔄 Reading schema...');
        const schemaPath = path.join(__dirname, 'server', 'sql', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by GO and semicolons
        const statements = schema
            .replace(/\bGO\b/g, ';')
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('USE'));

        console.log(`🔄 Executing ${statements.length} statements...`);
        for (const statement of statements) {
            try {
                await query(statement);
            } catch (err) {
                console.error(`❌ Error in statement: ${statement.substring(0, 50)}...`);
                console.error(`   ${err.message}`);
            }
        }
        console.log('✅ Schema initialized successfully!');
        process.exit(0);
    } catch (err) {
        console.error('💥 Critical error:', err);
        process.exit(1);
    }
}

initSchema();
