import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'antigravipizza.db');
const db = new Database(dbPath);

console.log('🔧 Verificando colonne mancanti nella tabella Recipes...\n');

try {
    const schema = db.prepare("PRAGMA table_info(Recipes)").all();
    const columnNames = schema.map(col => col.name);

    const columnsToAdd = [
        { name: 'toppingsDuringBake', type: 'TEXT' },
        { name: 'toppingsPostBake', type: 'TEXT' }
    ];

    let count = 0;
    for (const col of columnsToAdd) {
        if (!columnNames.includes(col.name)) {
            console.log(`➕ Aggiunta colonna ${col.name}...`);
            db.prepare(`ALTER TABLE Recipes ADD COLUMN ${col.name} ${col.type}`).run();
            console.log(`✅ Colonna ${col.name} aggiunta`);
            count++;
        } else {
            console.log(`✓ Colonna ${col.name} già presente`);
        }
    }

    if (count > 0) {
        console.log(`\n✅ Migrazione completata: ${count} colonne aggiunte.`);
    } else {
        console.log('\n✅ Database già aggiornato.');
    }

} catch (err) {
    console.error('❌ Errore durante la migrazione:', err.message);
} finally {
    db.close();
}
