/**
 * Script per mostrare tutti gli ingredienti SENZA tag
 * Organizzati per categoria per capire perché non hanno tag
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../antigravipizza.db');

console.log('🔍 INGREDIENTI SENZA TAG\n');
console.log('Analisi degli ingredienti che non hanno tag assegnati\n');
console.log('='.repeat(70));

const db = new Database(dbPath);

try {
    // Ottieni tutti gli ingredienti senza tag
    const ingredientsWithoutTags = db.prepare(`
        SELECT i.id, i.name, c.name as category
        FROM Ingredients i
        LEFT JOIN Categories c ON i.categoryId = c.id
        WHERE i.tags IS NULL OR i.tags = '[]'
        ORDER BY c.name, i.name
    `).all();

    console.log(`\nTotale ingredienti senza tag: ${ingredientsWithoutTags.length}\n`);

    // Raggruppa per categoria
    const byCategory = {};
    ingredientsWithoutTags.forEach(ing => {
        const cat = ing.category || 'Senza Categoria';
        if (!byCategory[cat]) {
            byCategory[cat] = [];
        }
        byCategory[cat].push(ing.name);
    });

    // Mostra per categoria
    Object.entries(byCategory).forEach(([category, ingredients]) => {
        console.log(`\n📦 ${category} (${ingredients.length} ingredienti)`);
        console.log('-'.repeat(70));

        ingredients.forEach((name, index) => {
            console.log(`   ${(index + 1).toString().padStart(2)}. ${name}`);
        });
    });

    // Analisi tipologie
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 ANALISI TIPOLOGIE:\n');

    const analysis = {
        baseIngredients: [],
        instructions: [],
        generic: [],
        variants: []
    };

    ingredientsWithoutTags.forEach(ing => {
        const name = ing.name.toLowerCase();

        // Ingredienti di base (farina, sale, acqua, ecc.)
        if (name.includes('farina') || name.includes('lievito') ||
            name === 'sale' || name === 'sale grosso' || name === 'sale fino' || name === 'sale maldon' ||
            name === 'acqua' || name === 'olio' || name.includes('olio di semi') ||
            name === 'burro' || name === 'panna' || name === 'latte' ||
            name === 'uova' || name === 'tuorlo' || name === 'brodo') {
            analysis.baseIngredients.push(ing.name);
        }
        // Istruzioni travestite da ingredienti
        else if (name.includes('frullare') || name.includes('bollire') ||
            name.includes('grigliare') || name.includes('soffriggere') ||
            name.includes('unire') || name.includes('pulire') ||
            name.includes('marinatura') || name.includes('bicchiere')) {
            analysis.instructions.push(ing.name);
        }
        // Varianti di ingredienti già taggati
        else if (name === 'cipolla' || name === 'cipolle tropeana' || name === 'cipolla o cipollotto' ||
            name === 'pomodorini' || name === 'parmigiano' || name === 'pecorino' ||
            name === 'olive nere' || name === 'olive verdi') {
            analysis.variants.push(ing.name);
        }
        // Generici
        else {
            analysis.generic.push(ing.name);
        }
    });

    console.log(`🔧 Ingredienti di Base/Preparazione: ${analysis.baseIngredients.length}`);
    console.log('   (Farina, sale, lievito, acqua, olio, uova, brodo, ecc.)\n');
    analysis.baseIngredients.slice(0, 10).forEach(name => console.log(`   • ${name}`));
    if (analysis.baseIngredients.length > 10) {
        console.log(`   ... e altri ${analysis.baseIngredients.length - 10}`);
    }

    console.log(`\n📝 Istruzioni (non ingredienti): ${analysis.instructions.length}`);
    console.log('   (Es: "Frullare il tutto", "Bollire le patate")\n');
    analysis.instructions.forEach(name => console.log(`   • ${name}`));

    console.log(`\n🔄 Varianti di ingredienti già taggati: ${analysis.variants.length}`);
    console.log('   (Es: "Cipolla" generico vs "Cipolla caramellata" taggato)\n');
    analysis.variants.forEach(name => console.log(`   • ${name}`));

    console.log(`\n❓ Altri ingredienti generici: ${analysis.generic.length}`);
    if (analysis.generic.length > 0) {
        console.log('   (Potrebbero beneficiare di tag)\n');
        analysis.generic.forEach(name => console.log(`   • ${name}`));
    }

    // Conclusione
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ CONCLUSIONE:\n');
    console.log(`La maggior parte degli ingredienti senza tag (${analysis.baseIngredients.length + analysis.instructions.length}) sono:`);
    console.log('   1. Ingredienti di base per preparazioni (farina, sale, acqua)');
    console.log('   2. Istruzioni di cucina (non veri ingredienti)');
    console.log('   3. Varianti generiche di ingredienti già taggati\n');
    console.log('Questi ingredienti NON vengono usati dal generatore di pizze,');
    console.log('quindi non necessitano di tag per il sistema di selezione.\n');

    if (analysis.generic.length > 0) {
        console.log(`⚠️  Ci sono ${analysis.generic.length} ingredienti "Altri" che potrebbero`);
        console.log('   beneficiare di tag se dovessero essere usati dal generatore.\n');
    }

} catch (error) {
    console.error('\n❌ Errore:', error.message);
    process.exit(1);
} finally {
    db.close();
}
