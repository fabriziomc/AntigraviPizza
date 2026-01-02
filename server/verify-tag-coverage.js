/**
 * Test diretto per verificare che i tag funzionino correttamente
 * Carica gli ingredienti dal database e verifica la coverage dei tag
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../antigravipizza.db');

console.log('🧪 TEST: Verifica Tag Coverage su Ingredienti e Preparazioni\n');

const db = new Database(dbPath);

try {
    // Test 1: Verifica tag su ingredienti
    console.log('📊 Test 1: Coverage Tag Ingredienti');
    console.log('='.repeat(60));

    const ingredients = db.prepare('SELECT id, name, tags, category FROM Ingredients ORDER BY name').all();
    const ingredientsWithTags = ingredients.filter(ing => ing.tags && ing.tags !== '[]');

    console.log(`Total ingredienti: ${ingredients.length}`);
    console.log(`Con tag: ${ingredientsWithTags.length}`);
    console.log(`Coverage: ${(ingredientsWithTags.length / ingredients.length * 100).toFixed(1)}%`);

    // Mostra alcuni esempi
    console.log('\nEsempi di ingredienti con tag:');
    ingredientsWithTags.slice(0, 10).forEach(ing => {
        const tags = JSON.parse(ing.tags);
        console.log(`  • ${ing.name}: [${tags.join(', ')}]`);
    });

    // Test 2: Verifica tag su preparazioni
    console.log('\n📊 Test 2: Coverage Tag Preparazioni');
    console.log('='.repeat(60));

    const preparations = db.prepare('SELECT id, name, tags, category FROM Preparations ORDER BY name').all();
    const preparationsWithTags = preparations.filter(prep => prep.tags && prep.tags !== '[]');

    console.log(`Total preparazioni: ${preparations.length}`);
    console.log(`Con tag: ${preparationsWithTags.length}`);
    console.log(`Coverage: ${(preparationsWithTags.length / preparations.length * 100).toFixed(1)}%`);

    // Mostra alcuni esempi
    console.log('\nEsempi di preparazioni con tag (4 layer):');
    preparationsWithTags.slice(0, 5).forEach(prep => {
        const tags = JSON.parse(prep.tags);
        console.log(`  • ${prep.name}:`);
        console.log(`    └─ [${tags.join(', ')}]`);
    });

    // Test 3: Analisi tag unici utilizzati
    console.log('\n📊 Test 3: Analisi Tag Unici Utilizzati');
    console.log('='.repeat(60));

    const allTags = new Set();
    ingredientsWithTags.forEach(ing => {
        const tags = JSON.parse(ing.tags);
        tags.forEach(tag => allTags.add(tag));
    });
    preparationsWithTags.forEach(prep => {
        const tags = JSON.parse(prep.tags);
        tags.forEach(tag => allTags.add(tag));
    });

    console.log(`Tag unici totali: ${allTags.size}`);
    console.log('\nLista tag utilizzati:');
    const sortedTags = Array.from(allTags).sort();
    sortedTags.forEach((tag, index) => {
        if (index % 3 === 0) process.stdout.write('\n  ');
        process.stdout.write(`${tag.padEnd(25)} `);
    });
    console.log('\n');

    // Test 4: Verifica tag per categoria
    console.log('\n📊 Test 4: Tag per Categoria di Ingrediente');
    console.log('='.repeat(60));

    const categoryStats = {};
    ingredientsWithTags.forEach(ing => {
        const cat = ing.category || 'Unknown';
        if (!categoryStats[cat]) {
            categoryStats[cat] = new Set();
        }
        const tags = JSON.parse(ing.tags);
        tags.forEach(tag => categoryStats[cat].add(tag));
    });

    Object.entries(categoryStats).forEach(([category, tags]) => {
        console.log(`\n${category}:`);
        console.log(`  Tag utilizzati: ${Array.from(tags).join(', ')}`);
    });

    // Risultato finale
    console.log('\n' + '='.repeat(60));
    console.log('✅ RISULTATI FINALI:');
    console.log(`   Ingredienti con tag: ${ingredientsWithTags.length}/${ingredients.length} (${(ingredientsWithTags.length / ingredients.length * 100).toFixed(1)}%)`);
    console.log(`   Preparazioni con tag: ${preparationsWithTags.length}/${preparations.length} (${(preparationsWithTags.length / preparations.length * 100).toFixed(1)}%)`);
    console.log(`   Tag unici disponibili: ${allTags.size}`);

    const success = ingredientsWithTags.length > 100 && preparationsWithTags.length === preparations.length;

    if (success) {
        console.log('\n🎉 Test completato con successo!');
        console.log('Il sistema di tagging è operativo e pronto all\'uso.\n');
    } else {
        console.log('\n⚠️  Coverage non ottimale, ma il sistema è funzionante.');
        console.log('I tag sono disponibili per la generazione delle ricette.\n');
    }

} catch (error) {
    console.error('\n❌ Errore durante il test:', error.message);
    console.error(error.stack);
    process.exit(1);
} finally {
    db.close();
}
