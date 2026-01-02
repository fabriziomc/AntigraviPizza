import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Conversione seed-data-preparations.json a IDs ===\n');

// 1. Leggi seed-data-ingredients.json per creare mappa nome → ID
console.log('📋 Lettura seed-data-ingredients.json...');
const ingredientsFile = path.join(__dirname, 'seed-data-ingredients.json');
const ingredientsData = JSON.parse(fs.readFileSync(ingredientsFile, 'utf8'));

const ingredientMap = new Map();
ingredientsData.ingredients.forEach(ing => {
    const normalizedName = ing.name.toLowerCase().trim();
    ingredientMap.set(normalizedName, ing.id);
});

console.log(`✅ Mappa creata con ${ingredientMap.size} ingredienti\n`);

// 2. Leggi seed-data-preparations.json
console.log('📦 Lettura seed-data-preparations.json...');
const preparationsFile = path.join(__dirname, 'seed-data-preparations.json');
const preparationsData = JSON.parse(fs.readFileSync(preparationsFile, 'utf8'));

console.log(`✅ Trovate ${preparationsData.preparations.length} preparazioni\n`);

// 3. Crea backup del file originale
const backupFile = path.join(__dirname, 'seed-data-preparations-backup-' + Date.now() + '.json');
fs.writeFileSync(backupFile, JSON.stringify(preparationsData, null, 2));
console.log(`💾 Backup salvato: ${path.basename(backupFile)}\n`);

// 4. Converti ogni preparazione
console.log('🔄 Inizio conversione...\n');

let converted = 0;
let alreadyConverted = 0;
let errors = 0;
const notFoundIngredients = new Set();
const conversions = [];

for (const prep of preparationsData.preparations) {
    try {
        if (!prep.ingredients || prep.ingredients === '[]') {
            continue;
        }

        const ingredientsList = JSON.parse(prep.ingredients);
        let needsConversion = false;
        const convertedIngredients = [];

        for (const ing of ingredientsList) {
            // Se ha già ingredientId, è già convertito
            if (ing.ingredientId) {
                convertedIngredients.push(ing);
                continue;
            }

            // Se ha il name, deve essere convertito
            if (ing.name) {
                needsConversion = true;
                const normalizedName = ing.name.toLowerCase().trim();
                const ingredientId = ingredientMap.get(normalizedName);

                if (ingredientId) {
                    // Crea nuovo oggetto con solo ingredientId e dati di quantità
                    const newIng = {
                        ingredientId: ingredientId,
                        quantity: ing.quantity || 100,
                        unit: ing.unit || 'g'
                    };

                    // Aggiungi perPortion se presente, altrimenti calcolalo
                    if (ing.perPortion) {
                        newIng.perPortion = typeof ing.perPortion === 'string'
                            ? parseFloat(ing.perPortion)
                            : ing.perPortion;
                    } else {
                        newIng.perPortion = parseFloat(((ing.quantity || 100) / (prep.yield || 4)).toFixed(2));
                    }

                    convertedIngredients.push(newIng);

                    conversions.push({
                        prep: prep.name,
                        from: ing.name,
                        to: ingredientId
                    });
                } else {
                    console.warn(`⚠️  Ingrediente non trovato: "${ing.name}" nella preparazione "${prep.name}"`);
                    notFoundIngredients.add(ing.name);
                    // Mantieni l'oggetto originale per non perdere dati
                    convertedIngredients.push(ing);
                    // NON incrementare errors - permetti conversione parziale
                }
            } else {
                // Oggetto senza name né ingredientId - mantieni così
                convertedIngredients.push(ing);
            }
        }

        if (needsConversion) {
            // Aggiorna la preparazione con gli ingredienti convertiti
            prep.ingredients = JSON.stringify(convertedIngredients);
            converted++;
            console.log(`✓ ${prep.name}`);
        } else {
            alreadyConverted++;
        }

    } catch (error) {
        console.error(`❌ Errore con preparazione "${prep.name}":`, error.message);
        errors++;
    }
}

console.log('\n=== RISULTATI CONVERSIONE ===');
console.log(`✅ Preparazioni convertite: ${converted}`);
console.log(`ℹ️  Già convertite: ${alreadyConverted}`);
console.log(`❌ Errori: ${errors}`);

if (notFoundIngredients.size > 0) {
    console.log('\n⚠️  INGREDIENTI NON TROVATI:');
    Array.from(notFoundIngredients).sort().forEach(name => {
        console.log(`   - ${name}`);
    });
    console.log('\n❗ Questi ingredienti devono essere aggiunti a seed-data-ingredients.json');
    console.log('   oppure rimossi dalle preparazioni prima di procedere.\n');
}

// 5. Salva il file aggiornato
if (converted > 0 && errors === 0) {
    fs.writeFileSync(preparationsFile, JSON.stringify(preparationsData, null, 2));
    console.log(`\n💾 File aggiornato: seed-data-preparations.json`);
    console.log(`   ${converted} preparazioni migrate con successo!\n`);

    // Mostra alcuni esempi di conversioni
    if (conversions.length > 0) {
        console.log('📋 Esempi di conversioni:');
        conversions.slice(0, 5).forEach(c => {
            console.log(`   ${c.prep}: "${c.from}" → ${c.to.substring(0, 8)}...`);
        });
        if (conversions.length > 5) {
            console.log(`   ... e altre ${conversions.length - 5} conversioni`);
        }
    }
} else if (errors > 0) {
    console.log('\n❌ CONVERSIONE NON COMPLETATA');
    console.log('   Risolvi prima gli errori sopra indicati.');
    console.log(`   Il file originale è stato preservato in: ${path.basename(backupFile)}`);
} else {
    console.log('\n✓ Nessuna conversione necessaria - tutte le preparazioni usano già ingredientId');
}

// 6. Mostra verifica per "Emulsione di aglio nero"
console.log('\n=== VERIFICA: Emulsione di aglio nero ===');
const emulsion = preparationsData.preparations.find(p => p.name === 'Emulsione di aglio nero');
if (emulsion) {
    const ingredients = JSON.parse(emulsion.ingredients);
    console.log(`Numero ingredienti: ${ingredients.length}`);
    ingredients.forEach((ing, index) => {
        if (ing.ingredientId) {
            console.log(`${index + 1}. ID: ${ing.ingredientId.substring(0, 8)}... (${ing.quantity} ${ing.unit})`);
        } else if (ing.name) {
            console.log(`${index + 1}. NOME: ${ing.name} (${ing.quantity} ${ing.unit}) - ⚠️ Non convertito`);
        }
    });
} else {
    console.log('❌ Preparazione non trovata');
}

console.log('\n✓ Conversione completata!');
console.log('\n📝 Prossimi passi:');
console.log('   1. Verifica il file seed-data-preparations.json');
console.log('   2. Esegui il seed del database: node -e "import(\'./seed-service.js\').then(m => m.seedAll())"');
console.log('   3. Verifica con: node verify-aglio-nero.js\n');
