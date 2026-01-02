import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../antigravipizza.db');

/**
 * Migration script to update preparation categories to new method-based taxonomy
 */

// Specific mappings by preparation name
const NAME_BASED_MAPPING = {
    // Creme (frullate/cremose)
    'Crema di Patate': 'Creme',
    'Crema di Zucca': 'Creme',
    'Crema di Carciofi': 'Creme',
    'Crema di Pistacchio': 'Creme',
    'Crema di Burrata': 'Creme',
    'Crema di Ricotta': 'Creme',
    'Crema di Gorgonzola': 'Creme',
    'Crema di Melone': 'Creme',
    'Crema di barbabietola': 'Creme',
    'Crema di castagne': 'Creme',
    'Crema di ceci': 'Creme',
    'Crema di friarielli': 'Creme',
    'Crema di patate': 'Creme',
    'Crema di patate viola': 'Creme',
    'Crema di pecorino': 'Creme',
    'Crema di piselli': 'Creme',
    'Crema di zucchine': 'Creme',
    'Pomodori secchi (crema)': 'Creme',

    // Salse (liquide/semi-liquide)
    'Pesto di Basilico': 'Salse',
    'Salsa BBQ': 'Salse',
    'Pesto di Rucola': 'Salse',
    'Salsa di Nduja': 'Salse',
    'Pesto di Pomodori Secchi': 'Salse',
    'Salsa al Tartufo': 'Salse',
    'Pesto di Olive Taggiasche': 'Salse',
    'Riduzione di Aceto Balsamico': 'Salse',
    'Emulsione di aglio nero': 'Salse',
    'Gel di agrumi': 'Salse',
    'Guacamole': 'Salse',
    'Maionese al wasabi': 'Salse',
    'Salsa aioli': 'Salse',
    'Salsa al mango': 'Salse',
    'Salsa di pistacchi': 'Salse',
    'Pomodoro stracotto': 'Salse',
    'Ragù napoletano': 'Salse',
    'Pesto di rucola': 'Salse',

    // Trifolati/Saltati (in padella)
    'Funghi Trifolati': 'Trifolati/Saltati',
    'Guanciale Croccante': 'Trifolati/Saltati',
    'Cipolla Caramellata': 'Trifolati/Saltati',
    'Cipolla caramellata': 'Trifolati/Saltati',
    'Cavolo nero stufato': 'Trifolati/Saltati',
    'Dadolata di patate': 'Trifolati/Saltati',
    'Patate in crosta': 'Trifolati/Saltati',

    // Confit/Grigliati (forno/griglia)
    'Pomodori Confit': 'Confit/Grigliati',
    'Melanzane Grigliate': 'Confit/Grigliati',
    'Peperoni Arrosto': 'Confit/Grigliati',
    'Pomodorini confit': 'Confit/Grigliati',
    'Melanzane grigliate': 'Confit/Grigliati',
    'Finocchi grigliati': 'Confit/Grigliati'
};

console.log('🔧 Starting preparation categories migration...\n');

const db = new Database(dbPath);

try {
    // Get all preparations
    const preparations = db.prepare('SELECT id, name, category FROM preparations').all();

    console.log(`Found ${preparations.length} preparations to update\n`);

    let updated = 0;
    let unchanged = 0;

    const updateStmt = db.prepare('UPDATE preparations SET category = ? WHERE id = ?');

    for (const prep of preparations) {
        const oldCategory = prep.category;
        const newCategory = NAME_BASED_MAPPING[prep.name] || 'Altro';

        if (newCategory !== oldCategory) {
            updateStmt.run(newCategory, prep.id);
            console.log(`✅ ${prep.name}: "${oldCategory}" → "${newCategory}"`);
            updated++;
        } else {
            unchanged++;
        }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Updated: ${updated}`);
    console.log(`   Unchanged: ${unchanged}`);
    console.log('\n✨ Migration completed!\n');

    // Show category distribution
    const categoryCount = db.prepare(`
        SELECT category, COUNT(*) as count 
        FROM preparations 
        GROUP BY category 
        ORDER BY count DESC
    `).all();

    console.log('📈 New category distribution:');
    categoryCount.forEach(cat => {
        console.log(`   ${cat.category}: ${cat.count}`);
    });

} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
} finally {
    db.close();
}
