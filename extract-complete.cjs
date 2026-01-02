const XLSX = require('xlsx');
const fs = require('fs');

const excelPath = './MENU\' PIZZE.xlsx';
const workbook = XLSX.readFile(excelPath);
const sheetName = 'Ricette dei preparati';
const worksheet = workbook.Sheets[sheetName];
const range = XLSX.utils.decode_range(worksheet['!ref']);

console.log('🔍 Extracting preparations with ALL columns...\n');

const preparations = [];

for (let R = range.s.r; R <= range.e.r; ++R) {
    const row = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        row.push(cell ? cell.v : null);
    }

    // Column B (index 1) has preparation names
    const prepName = row[1];

    // If it's a preparation name (has * or looks like a prep)
    if (prepName && typeof prepName === 'string' && prepName.trim() !== '') {
        const cleanName = prepName.replace(/\s*\*\s*$/g, '').trim();

        // Skip headers or metadata
        if (cleanName.length > 2 && !cleanName.match(/^Q\.TA\'?$/i) && !cleanName.match(/^PREPARAZIONE$/i)) {
            // Extract ingredients from all columns
            const ingredients = [];

            for (let col = 2; col < row.length; col++) {
                const cellValue = row[col];
                if (cellValue && typeof cellValue === 'string') {
                    const text = cellValue.trim();

                    // Skip URLs and non-ingredient text
                    if (!text.startsWith('http') && !text.startsWith('Aggiungi') && text.length > 2) {
                        // Check if it's a comma-separated list
                        if (text.includes(',')) {
                            const items = text.split(',').map(s => s.trim()).filter(s => s.length > 2);
                            ingredients.push(...items);
                        } else {
                            ingredients.push(text);
                        }
                    }
                }
            }

            preparations.push({
                name: cleanName,
                ingredients: [...new Set(ingredients)], // Remove duplicates
                row: R + 1
            });
        }
    }
}

console.log(`✅ Found ${preparations.length} preparations with ingredients\n`);

// Show first 10
console.log('First 10 preparations:\n');
preparations.slice(0, 10).forEach(prep => {
    console.log(`📝 ${prep.name} (row ${prep.row})`);
    if (prep.ingredients.length > 0) {
        prep.ingredients.forEach(ing => console.log(`   - ${ing}`));
    } else {
        console.log(`   (no ingredients found)`);
    }
    console.log('');
});

// Save
fs.writeFileSync('preparations-with-ingredients.json', JSON.stringify(preparations, null, 2));
console.log(`\n✅ Saved to preparations-with-ingredients.json`);

// Count total unique ingredients
const allIngredients = new Set();
preparations.forEach(p => p.ingredients.forEach(i => allIngredients.add(i.toLowerCase())));
console.log(`\n📊 Total unique ingredients: ${allIngredients.size}`);
