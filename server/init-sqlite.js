import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'antigravipizza.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

console.log('========================================');
console.log('  INIZIALIZZAZIONE DATABASE SQLite');
console.log('========================================\n');

// Crea nuovo database
console.log(`📁 Creazione database: ${dbPath}`);
const db = new Database(dbPath);

// Leggi e esegui schema
console.log(`📝 Lettura schema: ${schemaPath}`);
const schema = fs.readFileSync(schemaPath, 'utf8');

// Esegui ogni statement
const statements = schema.split(';').filter(s => s.trim().length > 0);
console.log(`⚙️  Esecuzione di ${statements.length} statements SQL...\n`);

statements.forEach((stmt, index) => {
    const trimmed = stmt.trim();
    if (trimmed) {
        console.log(`   [${index + 1}/${statements.length}] ${trimmed.substring(0, 50)}...`);
        db.exec(trimmed);
    }
});

console.log('\n========================================');
console.log('✅ DATABASE CREATO CON SUCCESSO!');
console.log('========================================\n');

console.log('Tabelle create:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(t => console.log(`  - ${t.name}`));

console.log('\n🎉 Pronto per l\'uso!');
console.log('   Avvia il server con: npm start');
console.log('   Oppure usa: node server/avvia_app_sqlite.bat\n');

db.close();
