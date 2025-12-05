import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'antigravipizza.db');

console.log('========================================');
console.log('  ESPORTAZIONE DATI DA SQLITE');
console.log('========================================\n');

try {
    const db = new Database(dbPath);

    // Export Recipes
    console.log('📦 Esportazione Recipes...');
    const recipes = db.prepare('SELECT * FROM Recipes').all();
    console.log(`   ✅ ${recipes.length} ricette esportate`);

    // Export Pizza Nights
    console.log('📦 Esportazione Pizza Nights...');
    const pizzaNights = db.prepare('SELECT * FROM PizzaNights').all();
    console.log(`   ✅ ${pizzaNights.length} pizza nights esportate`);

    // Export Guests
    console.log('📦 Esportazione Guests...');
    const guests = db.prepare('SELECT * FROM Guests').all();
    console.log(`   ✅ ${guests.length} ospiti esportati`);

    // Export Combinations
    console.log('📦 Esportazione Combinations...');
    const combinations = db.prepare('SELECT * FROM Combinations').all();
    console.log(`   ✅ ${combinations.length} combinazioni esportate`);

    // Create export object
    const exportData = {
        exportDate: new Date().toISOString(),
        source: 'SQLite',
        recipes,
        pizzaNights,
        guests,
        combinations
    };

    // Save to file
    const exportPath = path.join(__dirname, '..', 'migration-data.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

    console.log('\n========================================');
    console.log('✅ ESPORTAZIONE COMPLETATA!');
    console.log(`📁 File salvato: ${exportPath}`);
    console.log('========================================\n');

    db.close();

} catch (err) {
    console.error('❌ Errore durante l\'esportazione:', err.message);
    process.exit(1);
}
