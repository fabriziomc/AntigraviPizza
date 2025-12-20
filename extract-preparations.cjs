const XLSX = require('xlsx');
const fs = require('fs');

const excelPath = './MENU\' PIZZE.xlsx';
const workbook = XLSX.readFile(excelPath);
const sheetName = 'Ricette dei preparati';
const worksheet = workbook.Sheets[sheetName];
const range = XLSX.utils.decode_range(worksheet['!ref']);

console.log('🔍 Extracting preparations and ingredients...\n');

// Parse all rows
const preparations = [];
let currentPrep = null;

for (let R = range.s.r; R <= range.e.r; ++R) {
    const row = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        row.push(cell ? cell.v : null);
    }

    // Column B (index 1) seems to have preparation names
    const prepName = row[1];

    // If it's a non-empty string and looks like a preparation name
    if (prepName && typeof prepName === 'string' && prepName.trim() !== '') {
        // Check if it's a new preparation (not a continuation or ingredient)
        if (!prepName.includes(',') && prepName.length > 3) {
            // Save previous prep
            if (currentPrep) {
                preparations.push(currentPrep);
            }

            // Start new prep
            currentPrep = {
                name: prepName.trim(),
                ingredientsRaw: [],
                row: R + 1
            };
        }
    }

    // Check other columns for ingredients
    // Column F (index 5) seems to sometimes have ingredient lists
    const ingredientsList = row[5];
    if (currentPrep && ingredientsList && typeof ingredientsList === 'string') {
        // Split by comma
        const ings = ingredientsList.split(',').map(s => s.trim()).filter(s => s.length > 0);
        currentPrep.ingredientsRaw.push(...ings);
    }
}

// Add last prep
if (currentPrep) {
    preparations.push(currentPrep);
}

console.log(`✅ Found ${preparations.length} preparations\n`);

// Show first 10
console.log('First 10 preparations:\n');
preparations.slice(0, 10).forEach(prep => {
    console.log(`${prep.name} (row ${prep.row})`);
    console.log(`  Ingredients: ${prep.ingredientsRaw.length > 0 ? prep.ingredientsRaw.join(', ') : 'none found'}`);
    console.log('');
});

// Save full list
fs.writeFileSync('extracted-preparations.json', JSON.stringify(preparations, null, 2));
console.log('\n✅ Saved to extracted-preparations.json');
