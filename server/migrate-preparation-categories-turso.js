// ============================================
// MIGRATE PREPARATION CATEGORIES FOR TURSO
// ============================================

import { getDb } from './db.js';

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

async function migratePreparationCategoriesTurso() {
    console.log('🔧 Starting preparation categories migration for Turso...\n');

    const db = getDb();
    const isTurso = typeof db?.execute === 'function';

    if (!isTurso) {
        console.error('❌ This script is for Turso only!');
        return;
    }

    try {
        // Get all preparations
        const result = await db.execute('SELECT id, name, category FROM preparations');
        const preparations = result.rows;

        console.log(`Found ${preparations.length} preparations to update\n`);

        let updated = 0;
        let unchanged = 0;

        for (const prep of preparations) {
            const oldCategory = prep.category;
            const newCategory = NAME_BASED_MAPPING[prep.name] || 'Altro';

            if (newCategory !== oldCategory) {
                await db.execute({
                    sql: 'UPDATE preparations SET category = ? WHERE id = ?',
                    args: [newCategory, prep.id]
                });
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
        const categoryResult = await db.execute(`
            SELECT category, COUNT(*) as count 
            FROM preparations 
            GROUP BY category 
            ORDER BY count DESC
        `);

        console.log('📈 New category distribution:');
        categoryResult.rows.forEach(cat => {
            console.log(`   ${cat.category}: ${cat.count}`);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migratePreparationCategoriesTurso().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
